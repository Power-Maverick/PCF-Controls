import { IInputs, IOutputs } from "./generated/ManifestTypes";
import * as React from "react";
import * as ReactDOM from "react-dom";
import DataSetInterfaces = ComponentFramework.PropertyHelper.DataSetApi;
import { ListControl, IListControlProps, IListControlState, IListData, IListColumn } from "./extension/ListControl";

type DataSet = ComponentFramework.PropertyTypes.DataSet;

export class FlexibleOrderingGrid implements ComponentFramework.StandardControl<IInputs, IOutputs> {
    /**
     * Global Variables
     */
    private theContainer: HTMLDivElement;
    private theNotifyOutputChanged: () => void;
    private theContext: ComponentFramework.Context<IInputs>;
    private theOrderColumn: IListColumn;

    /**
     * HTML Attributes
     */
    private divDetailListWrapper: HTMLDivElement;

    // React properties
    private _props: IListControlProps = {
        data: [],
        columns: [],
        totalResultCount: 0,
        allocatedWidth: 0,
        enableAutoSave: false,
        isSaving: false,
    };

    /**
     * Empty constructor.
     */
    constructor() {} // eslint-disable-next-line @typescript-eslint/no-empty-function

    /**
     * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
     * Data-set values are not initialized here, use updateView.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
     * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
     * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
     * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
     */
    public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container: HTMLDivElement): void {
        this.theNotifyOutputChanged = notifyOutputChanged;
        this.theContainer = container;
        this.theContext = context;

        this._props.triggerNavigate = this.navigateToRecord.bind(this);
        this._props.triggerPaging = this.navigateToPage.bind(this);
        this._props.triggerSelection = this.recordSelection.bind(this);
        this._props.triggerUpdate = this.updateRecords.bind(this);

        context.mode.trackContainerResize(true);
        this.theContainer.style.position = "relative";

        this.divDetailListWrapper = document.createElement("div");
        this.divDetailListWrapper.setAttribute("id", "detailListLocal");
        this.divDetailListWrapper.setAttribute("data-is-scrollable", "true");
        
        let rowspan = this.theContext.parameters.listDataSet.paging.pageSize;
        let height = rowspan * 2 + /*Header*/ 4 + /*Footer*/ 4 + /*Margin*/ 2;
        if (rowspan) {
            this.divDetailListWrapper.style.height = `${height}em`;
        } else {
            this.divDetailListWrapper.style.height = "auto";
        }

        this.theContainer.appendChild(this.divDetailListWrapper);
    }

    /**
     * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
     */
    public updateView(context: ComponentFramework.Context<IInputs>): void {
        if (context.parameters.listDataSet.loading) return;

        const dataSet = context.parameters.listDataSet;

        let datasetColumns: IListColumn[] = this._columns(dataSet);
        this._props.orderColumn = datasetColumns.find((c) => {
            return c.fieldName === "orderColumn";
        });
        if (this._props.orderColumn) {
            this.theOrderColumn = this._props.orderColumn;
        }

        let dataItems: IListData[] = this._items(dataSet, datasetColumns, this.theOrderColumn);
        this._props.allocatedWidth = context.mode.allocatedWidth === -1 ? 0 : context.mode.allocatedWidth;
        this._props.data = dataItems;
        this._props.columns = datasetColumns;
        this._props.totalResultCount = dataSet.paging.totalResultCount;
        this._props.enableAutoSave = context.parameters.autoSave.raw === "0" ? true : false;

        this.renderReactDOM();
        //ReactDOM.render(React.createElement(ListControl, this._props), this.divDetailListWrapper);
    }

    /**
     * It is called by the framework prior to a control receiving new data.
     * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
     */
    public getOutputs(): IOutputs {
        return {};
    }

    /**
     * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
     * i.e. cancelling any pending remote calls, removing listeners, etc.
     */
    public destroy(): void {
        // Add code to cleanup control if necessary
    }

    //#region **********PRIVATE PROPERTIES & FUNCTIONS**********

    private renderReactDOM(): void {
        ReactDOM.render(
            // Create the React component
            React.createElement(ListControl, this._props),
            this.divDetailListWrapper,
        );
    }

    // Get the columns from the dataset
    private _columns = (ds: DataSet): IListColumn[] => {
        let dataSet = ds;
        let iColumns: IListColumn[] = [];

        for (var column of dataSet.columns) {
            let iColumn: IListColumn = {
                key: column.name,
                name: column.displayName,
                fieldName: column.alias,
                currentWidth: column.visualSizeFactor,
                data: { isPrimary: column.isPrimary },
                minWidth: column.visualSizeFactor,
                maxWidth: column.visualSizeFactor,
                isResizable: true,
                sortAscendingAriaLabel: "A to Z",
                sortDescendingAriaLabel: "Z to A",
                className: "detailList-cell",
                headerClassName: "detailList-gridLabels",
                isPrimary: column.isPrimary,
            };

            //create links for primary field and entity reference.
            if (column.dataType.startsWith("Lookup.") || column.isPrimary) {
                iColumn.dataType = "Lookup";
            } else if (column.dataType === "SingleLine.Email") {
                iColumn.dataType = "Email";
            } else if (column.dataType === "SingleLine.Phone") {
                iColumn.dataType = "Phone";
            }

            let isSorted = dataSet?.sorting?.findIndex((s) => s.name === column.name) !== -1 || false;
            iColumn.isSorted = isSorted;
            if (isSorted) {
                iColumn.isSortedDescending = dataSet?.sorting?.find((s) => s.name === column.name)?.sortDirection === 1 || false;
            }

            iColumns.push(iColumn);
        }
        return iColumns;
    };

    // Get the items from the dataset
    private _items = (ds: DataSet, _columns: IListColumn[], orderColumn: IListColumn) => {
        let dataSet = ds;

        var resultSet = dataSet.sortedRecordIds
            .map(function (key) {
                var record = dataSet.records[key];
                var newRecord: any = {
                    key: record.getRecordId(),
                };

                for (var column of _columns) {
                    newRecord[column.key] = record.getFormattedValue(column.key);
                }

                return newRecord;
            })
            .sort((i1, i2) => {
                let first: number = parseInt(i1[orderColumn.key]);
                let second: number = parseInt(i2[orderColumn.key]);
                if (first > second) {
                    return 1;
                }
                if (first < second) {
                    return -1;
                }
                return 0;
            });

        return resultSet;
    };

    private navigateToPage(pageCommand: string): void {
        switch (pageCommand) {
            case "next":
                if (this.theContext.parameters.listDataSet.paging.hasNextPage) {
                    this.theContext.parameters.listDataSet.paging.loadNextPage();
                }
                break;
            case "previous":
                if (this.theContext.parameters.listDataSet.paging.hasPreviousPage) {
                    this.theContext.parameters.listDataSet.paging.loadPreviousPage();
                }
                break;
        }
    }

    private navigateToRecord(id: string): void {
        let record: any = this.theContext.parameters.listDataSet.records[id].getNamedReference();
        console.log(record);
        this.theContext.navigation.openForm({
            entityName: record.entityName,
            entityId: record.id,
        });
    }

    private recordSelection(selectedKeys: any[]): void {
        // TODO: Handle this with ordering
        //this.theContext.parameters.listDataSet.setSelectedRecordIds(selectedKeys);
    }

    private async updateRecords(listItems: any[]): Promise<void> {
        let entityName: string = this.theContext.parameters.listDataSet.getTargetEntityType();
        for (let o = 0; o < listItems.length; o++) {
            const item = listItems[o];
            listItems[o][this.theOrderColumn.key] = o;

            let updateOrderData: ComponentFramework.WebApi.Entity = {};
            updateOrderData[this.theOrderColumn.key] = o;

            await this.theContext.webAPI.updateRecord(entityName, item.key, updateOrderData);
        }

        this._props.data = listItems;
        this._props.isSaving = false;
        this.renderReactDOM();
    }

    //#endregion
}
