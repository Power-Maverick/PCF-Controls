import * as React from "react";
import { Link } from "@fluentui/react/lib/Link";
import { Label } from "@fluentui/react/lib/Label";
import { ScrollablePane, ScrollbarVisibility } from "@fluentui/react/lib/ScrollablePane";
import { DetailsList, IColumn, DetailsListLayoutMode, ConstrainMode, IDetailsFooterProps, Selection, SelectionMode, IDetailsHeaderProps, IDragDropEvents, IDragDropContext } from "@fluentui/react/lib/DetailsList";
import { getTheme, mergeStyles, mergeStyleSets } from "@fluentui/react/lib/Styling";
import { IRenderFunction } from "@fluentui/react/lib/Utilities";
import { Sticky, StickyPositionType } from "@fluentui/react/lib/Sticky";
import { CommandBar, ICommandBarItemProps } from "@fluentui/react/lib/CommandBar";
import { ThemeProvider } from "@fluentui/react/lib/Theme";
import { initializeIcons } from "@fluentui/react/lib/Icons";
import { FontIcon, Icon, Spinner } from "@fluentui/react";

// Initialize icons in case this example uses them
initializeIcons();

//#region Style Constants

const theme = getTheme();
const dragEnterClass = mergeStyles({
    backgroundColor: theme.palette.neutralLight,
});

//#endregion

//#region Interfaces
export interface IListControlProps {
    data: IListData[];
    columns: IListColumn[];
    orderColumn?: IListColumn;
    totalResultCount: number;
    allocatedWidth: number;
    enableAutoSave: boolean;
    isSaving: boolean;
    triggerNavigate?: (id: string) => void;
    triggerPaging?: (pageCommand: string) => void;
    triggerSelection?: (selectedKeys: any[]) => void;
    triggerUpdate?: (records: any[]) => void;
}

export interface IListData {
    attribute: string;
    value: string;
}

export interface IListColumn extends IColumn {
    dataType?: string;
    isPrimary?: boolean;
}

export interface IListControlState extends React.ComponentState {}
//#endregion

export class ListControl extends React.Component<IListControlProps, IListControlState> {
    //#region Global Variables
    private _selection: Selection;
    private _totalWidth: number;
    private _hoveringColumns: string[];
    private _dragDropEvents: IDragDropEvents;
    private _draggedIndex: number;
    private _draggedItem: IListData | undefined;
    //#endregion

    private _cmdBarFarItems: ICommandBarItemProps[];
    private _cmdBarItems: ICommandBarItemProps[];
    private _totalRecords: number;

    constructor(props: IListControlProps) {
        super(props);

        this._totalWidth = this._totalColumnWidth(props.columns);
        this._totalWidth = this._totalWidth > props.allocatedWidth ? this._totalWidth : props.allocatedWidth;
        //this._hoveringColumns = this._parseHoveringColumns(props.orderColumn);
        this._dragDropEvents = this._getDragDropEvents();
        this._totalRecords = props.totalResultCount;

        this.state = {
            _items: props.data,
            _columns: this._buildColumns(props.columns),
            _triggerNavigate: props.triggerNavigate,
            _triggerSelection: props.triggerSelection,
            _triggerPaging: props.triggerPaging,
            _triggerUpdate: props.triggerUpdate,
            _selectionCount: 0,
            _isSaving: props.isSaving,
            _unsavedChanged: false,
        };

        this._selection = new Selection({
            onSelectionChanged: () => {
                this.setState({
                    _selectionCount: this._setSelectionDetails(),
                });
            },
        });

        this._cmdBarItems = this.renderCommandBarItems(this.props.enableAutoSave);
        this._cmdBarFarItems = this.renderCommandBarFarItem(props.data.length);
    }

    public componentWillReceiveProps(newProps: IListControlProps): void {
        this.setState({
            _items: newProps.data,
            _columns: this._buildColumns(newProps.columns),
            _isSaving: newProps.isSaving,
        });
        this._totalWidth = this._totalColumnWidth(newProps.columns);
        this._cmdBarItems = this.renderCommandBarItems(this.props.enableAutoSave);
        this._cmdBarFarItems = this.renderCommandBarFarItem(newProps.data.length);
    }

    //#region Private functions
    private _onRenderDetailsHeader = (props: IDetailsHeaderProps | undefined, defaultRender?: IRenderFunction<IDetailsHeaderProps>): JSX.Element => {
        return (
            <Sticky stickyPosition={StickyPositionType.Header} isScrollSynced={true}>
                {defaultRender!({ ...props! })}
            </Sticky>
        );
    };

    private _onRenderDetailsFooter = (props: IDetailsFooterProps | undefined, defaultRender?: IRenderFunction<IDetailsFooterProps>): JSX.Element => {
        let savingStatusRow: any, unsavedChangedStatusRow: any;
        if (this.state._isSaving) {
            savingStatusRow = <Spinner className="footerSave" label="Saving changes..." ariaLive="assertive" labelPosition="left" />;
        } else {
            savingStatusRow = "";
        }
        if (this.state._unsavedChanged) {
            unsavedChangedStatusRow = <Label className="footerLabel footerUnsavedChanges">{"Unsaved changes"}</Label>;
        } else {
            unsavedChangedStatusRow = "";
        }
        return (
            <Sticky stickyPosition={StickyPositionType.Footer} isScrollSynced={true}>
                <div className={"footer"}>
                    {/* <Label className={"footerLabel"}>{`${this.state._selectionCount} selected`}</Label> */}
                    {savingStatusRow}
                    {unsavedChangedStatusRow}
                    <CommandBar className={"footerCmdBar"} farItems={this._cmdBarFarItems} items={this._cmdBarItems} />
                </div>
            </Sticky>
        );
    };

    private _onColumnClick = (ev?: React.MouseEvent<HTMLElement>, column?: IColumn): void => {
        let updatedColumns: IColumn[] = this.state._columns;
        let sortedItems: IListData[] = this.state._items;
        let isSortedDescending: boolean | undefined = column?.isSortedDescending;

        if (column?.isSorted) {
            isSortedDescending = !isSortedDescending;
        }

        sortedItems = this._sort(sortedItems, column?.fieldName!, isSortedDescending);

        this.setState({
            _items: sortedItems,
            _columns: updatedColumns.map((col) => {
                col.isSorted = col.key === column?.key;
                if (col.isSorted) {
                    col.isSortedDescending = isSortedDescending;
                }
                return col;
            }),
        });
    };

    private _setSelectionDetails(): number {
        let selectedKeys = [];
        let selections = this._selection.getSelection();
        for (let selection of selections) {
            selectedKeys.push(selection.key as string);
        }

        this.state._triggerSelection(selectedKeys);

        switch (selectedKeys.length) {
            case 0:
                return 0;
            default:
                return selectedKeys.length;
        }
    }

    private _sort = <T,>(items: T[], columnKey: string, isSortedDescending?: boolean): T[] => {
        let key = columnKey as keyof T;
        return items.slice(0).sort((a: T, b: T) => ((isSortedDescending ? a[key] < b[key] : a[key] > b[key]) ? 1 : -1));
    };

    private renderCommandBarItems(isAutoSaveEnabled: boolean): ICommandBarItemProps[] {
        if (isAutoSaveEnabled) {
            return [];
        } else {
            return [
                {
                    key: "save",
                    text: "Save",
                    iconProps: { iconName: "Save" },
                    onClick: () => {
                        if (this.state._triggerUpdate) {
                            this.setState({ _isSaving: true, _unsavedChanged: false });
                            this.state._triggerUpdate(this.state._items);
                        }
                    },
                },
            ];
        }
    }

    private renderCommandBarFarItem(recordsLoaded: number): ICommandBarItemProps[] {
        return [
            {
                key: "next",
                text: recordsLoaded == this._totalRecords ? `${recordsLoaded} of ${this._totalRecords}` : `Load more (${recordsLoaded} of ${this._totalRecords})`,
                ariaLabel: "Next",
                iconProps: { iconName: "ChevronRight" },
                disabled: recordsLoaded == this._totalRecords,
                onClick: () => {
                    if (this.state._triggerPaging) {
                        this.state._triggerPaging("next");
                    }
                },
            },
        ];
    }

    private _onItemInvoked(item: any): void {
        this.state._triggerNavigate(item.key);
    }

    private _buildColumns(listData: IListColumn[]): IColumn[] {
        let iColumns: IColumn[] = [];

        for (var column of listData) {
            let iColumn: IColumn = {
                key: column.key,
                name: column.name,
                fieldName: column.fieldName,
                currentWidth: column.currentWidth,
                minWidth: column.minWidth,
                maxWidth: column.maxWidth,
                isResizable: column.isResizable,
                sortAscendingAriaLabel: column.sortAscendingAriaLabel,
                sortDescendingAriaLabel: column.sortDescendingAriaLabel,
                className: column.className,
                headerClassName: column.headerClassName,
                data: column.data,
                isSorted: column.isSorted,
                isSortedDescending: column.isSortedDescending,
            };

            //create links for primary field and entity reference.
            if (column.dataType && (column.dataType === "Lookup" || column.isPrimary)) {
                iColumn.onRender = (item: any, index: number | undefined, column: IColumn | undefined) => (
                    <Link key={item.key} onClick={() => this.state._triggerNavigate(item.key)}>
                        {item[column?.fieldName!]}
                    </Link>
                );
            } else if (column.dataType === "Email") {
                iColumn.onRender = (item: any, index: number | undefined, column: IColumn | undefined) => <Link href={`mailto:${item[column?.fieldName!]}`}>{item[column?.fieldName!]}</Link>;
            } else if (column.dataType === "Phone") {
                iColumn.onRender = (item: any, index: number | undefined, column: IColumn | undefined) => <Link href={`skype:${item[column?.fieldName!]}?call`}>{item[column!.fieldName!]}</Link>;
            }

            iColumns.push(iColumn);
        }

        return iColumns;
    }

    private _totalColumnWidth(listData: IListColumn[]): number {
        let totalColumnWidth: number;

        totalColumnWidth = listData.map((v) => v.maxWidth!).reduce((sum, current) => sum + current);

        // Add extra buffer
        return totalColumnWidth + 100;
    }

    private _insertBeforeItem(item: IListData): void {
        const draggedItems = this._selection.isIndexSelected(this._draggedIndex) ? (this._selection.getSelection() as IListData[]) : [this._draggedItem!];

        const insertIndex = this.state._items.indexOf(item);
        const items: IListData[] = this.state._items.filter((item: IListData) => draggedItems.indexOf(item) === -1);

        items.splice(insertIndex, 0, ...draggedItems);

        this.setState({ _items: items });

        if (this.props.enableAutoSave) {
            this.setState({ _isSaving: true });
            if (this.state._triggerUpdate) {
                this.state._triggerUpdate(items);
            }
        } else {
            this.setState({ _unsavedChanged: true });
        }
    }

    private _getDragDropEvents(): IDragDropEvents {
        return {
            canDrop: (dropContext?: IDragDropContext, dragContext?: IDragDropContext) => {
                return true;
            },
            canDrag: (item?: any) => {
                return true;
            },
            onDragEnter: (item?: any, event?: DragEvent) => {
                // return string is the css classes that will be added to the entering element.
                return dragEnterClass;
            },
            onDragLeave: (item?: any, event?: DragEvent) => {
                return;
            },
            onDrop: (item?: any, event?: DragEvent) => {
                if (this._draggedItem) {
                    this._insertBeforeItem(item);
                }
            },
            onDragStart: (item?: any, itemIndex?: number, selectedItems?: any[], event?: MouseEvent) => {
                this._draggedItem = item;
                this._draggedIndex = itemIndex!;
            },
            onDragEnd: (item?: any, event?: DragEvent) => {
                this._draggedItem = undefined;
                this._draggedIndex = -1;
            },
        };
    }
    //#endregion

    //#region Main Render Function
    public render() {
        const styles = {
            divWidth: {
                width: this._totalWidth,
            },
        };

        return (
            <ThemeProvider>
                <ScrollablePane scrollbarVisibility={ScrollbarVisibility.auto}>
                    <DetailsList
                        setKey="parentcustomerid"
                        items={this.state._items}
                        columns={this.state._columns}
                        onColumnHeaderClick={this._onColumnClick}
                        layoutMode={DetailsListLayoutMode.justified}
                        constrainMode={ConstrainMode.unconstrained}
                        onItemInvoked={this._onItemInvoked}
                        dragDropEvents={this._dragDropEvents}
                        //selection={this._selection}
                        //selectionPreservedOnEmptyClick={true}
                        selectionMode={SelectionMode.none}
                        onRenderDetailsHeader={this._onRenderDetailsHeader}
                        onRenderDetailsFooter={this._onRenderDetailsFooter}
                        ariaLabelForSelectionColumn="Toggle selection"
                        ariaLabelForSelectAllCheckbox="Toggle selection for all items"
                        checkButtonAriaLabel="Row checkbox"
                    />
                </ScrollablePane>
            </ThemeProvider>
        );
    }
    //#endregion
}
