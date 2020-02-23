import * as React from 'react';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { HoverCard, IPlainCardProps, HoverCardType } from 'office-ui-fabric-react/lib/HoverCard';
import { Fabric } from 'office-ui-fabric-react/lib/Fabric';
import { ScrollablePane, ScrollbarVisibility } from 'office-ui-fabric-react/lib/ScrollablePane';
import { DetailsList, IColumn, DetailsListLayoutMode, ConstrainMode, IDetailsFooterProps, Selection, SelectionMode, IDetailsHeaderProps } from 'office-ui-fabric-react/lib/DetailsList';
import { mergeStyleSets } from 'office-ui-fabric-react/lib/Styling';
import { IRenderFunction } from 'office-ui-fabric-react/lib/Utilities';
import { Sticky, StickyPositionType } from 'office-ui-fabric-react/lib/Sticky';
import { CommandBar, ICommandBarItemProps } from 'office-ui-fabric-react/lib/CommandBar';
import { ITooltipHostProps, TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';

//#region Style Constants

const classNames = mergeStyleSets({
    plainCard: {
        width: 400,
        //height: 600,
        padding: '20px 10px',
        height: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        whiteSpace: 'pre-wrap'
    },
    item: {
        selectors: {
            '&:hover': {
                cursor: 'pointer'
            }
        }
    },
    listFooter: {
        display: 'flex',
        padding: '1px'
    },
    cmdBarFarItems: {
        fontSize: '0.857143rem',
        
    }
});

//#endregion

//#region Interfaces
export interface IListControlProps {
    data: IListData[];
    columns: IListColumn[];
    hoveringColumns: string;
    totalResultCount: number;
    allocatedWidth: number;
    triggerNavigate?: (id: string) => void;
    triggerPaging?: (pageCommand: string) => void;
    triggerSelection?: (selectedKeys: any[]) => void;
}

export interface IListData {
    attribute: string;
    value: string;
}

export interface IListColumn extends IColumn {
    dataType?: string,
    isPrimary?: boolean
}

export interface IListControlState extends React.ComponentState {
}
//#endregion 

export class ListControl extends React.Component<IListControlProps, IListControlState> {

    //#region Global Variables
    private _selection: Selection;
    private _totalWidth: number;
    private _hoveringColumns: string[];
    //#endregion

    private _cmdBarFarItems: ICommandBarItemProps[];
    private _cmdBarItems: ICommandBarItemProps[];
    private _totalRecords: number;

    constructor(props: IListControlProps) {
        super(props);

        this._totalWidth = this._totalColumnWidth(props.columns);
        this._totalWidth = this._totalWidth > props.allocatedWidth ? this._totalWidth : props.allocatedWidth;
        this._hoveringColumns = this._parseHoveringColumns(props.hoveringColumns);
        this._totalRecords = props.totalResultCount;

        this.state = {
            _items: props.data,
            _columns: this._buildColumns(props.columns),
            _triggerNavigate: props.triggerNavigate,
            _triggerSelection: props.triggerSelection,
            _triggerPaging: props.triggerPaging,
            _selectionCount: 0
        };

        this._selection = new Selection({
            onSelectionChanged: () => {
                this.setState({
                    _selectionCount: this._setSelectionDetails(),
                });
            }
        });

        this._cmdBarFarItems = this.renderCommandBarFarItem(props.data.length);
        this._cmdBarItems = [];
    }

    public componentWillReceiveProps(newProps: IListControlProps): void {
        this.setState({
            _items: newProps.data,
            _columns: this._buildColumns(newProps.columns)
        });
        this._totalWidth = this._totalColumnWidth(newProps.columns);

        this._cmdBarFarItems = this.renderCommandBarFarItem(newProps.data.length);
    }

    //#region Private functions
    private _onRenderShowPlainHoverCard = (item?: any, index?: number, column?: IColumn): JSX.Element | React.ReactText => {
        const plainCardProps: IPlainCardProps = {
            onRenderPlainCard: this._onRenderPlainCard,
            renderData: column ? item[column.key as keyof IListData] : ""
        };

        if (column) {
            return (
                <HoverCard plainCardProps={plainCardProps} instantOpenOnClick={true} type={HoverCardType.plain}>
                    <div className={classNames.item}>{item[column.key as keyof IListData]}</div>
                </HoverCard>
            );
        }

        // Return empty if column is NULL
        return "";
    }

    private _onRenderPlainCard = (item: string): JSX.Element => {
        return (
            <div className={classNames.plainCard}>
                {item}
            </div>
        );
    };

    private _onRenderDetailsHeader = (props: IDetailsHeaderProps | undefined, defaultRender?: IRenderFunction<IDetailsHeaderProps>): JSX.Element => {
        return (
          <Sticky stickyPosition={StickyPositionType.Header} isScrollSynced={true}>
            {defaultRender!({...props!})}
          </Sticky>
        );
      }

    private _onRenderDetailsFooter = (props: IDetailsFooterProps | undefined, defaultRender?: IRenderFunction<IDetailsFooterProps>): JSX.Element => {
        return (
            <Sticky stickyPosition={StickyPositionType.Footer} isScrollSynced={true}>
                <div className={classNames.listFooter}>
                    <Label className={"listFooterLabel"}>{`${this.state._selectionCount} selected`}</Label>
                    <CommandBar className={"cmdbar"} farItems={this._cmdBarFarItems} items={this._cmdBarItems} />
                </div>
            </Sticky>
        );
    }

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
            _columns:
                updatedColumns.map(col => {
                    col.isSorted = col.key === column?.key;
                    if (col.isSorted) {
                        col.isSortedDescending = isSortedDescending;
                    }
                    return col;
                })
        });
    }

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

    private _sort = <T, >(items: T[], columnKey: string, isSortedDescending?: boolean): T[] =>  {
        let key = columnKey as keyof T;
        return items.slice(0).sort((a: T, b: T) => ((isSortedDescending ? a[key] < b[key] : a[key] > b[key]) ? 1 : -1));
    }

    private renderCommandBarFarItem(recordsLoaded: number): ICommandBarItemProps[]
    {
        return [
            {
                key: 'next',
                text: (recordsLoaded == this._totalRecords) 
                        ? `${recordsLoaded} of ${this._totalRecords}` 
                        : `Load more (${recordsLoaded} of ${this._totalRecords})`,
                ariaLabel: 'Next',
                iconProps: { iconName: 'ChevronRight' },
                disabled: recordsLoaded == this._totalRecords,
                className: classNames.cmdBarFarItems,
                onClick: () => {
                    if (this.state._triggerPaging) {
                        this.state._triggerPaging("next");
                    }
                }
            }
        ];
    }

    private _onItemInvoked(item: any): void {
        this.state._triggerNavigate(item.key);
    }

    private _buildColumns(listData: IListColumn[]): IColumn[] {
        let iColumns: IColumn[] = [];

        for (var column of listData){
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
                isSortedDescending: column.isSortedDescending
            }
            
            //create links for primary field and entity reference.            
            if (column.dataType && (column.dataType === "Lookup" || column.isPrimary))
            {
                iColumn.onRender = (item: any, index: number | undefined, column: IColumn | undefined) => (
                    <Link key={item.key} onClick={() => this.state._triggerNavigate(item.key)}>{item[column?.fieldName!]}</Link>
                );
            }
            else if(column.dataType === "Email"){
                iColumn.onRender = (item: any, index: number | undefined, column: IColumn | undefined)=> (                                    
                    <Link href={`mailto:${item[column?.fieldName!]}`} >{item[column?.fieldName!]}</Link>  
                );
            }
            else if(column.dataType === "Phone"){
                iColumn.onRender = (item: any, index: number | undefined, column: IColumn | undefined) => (                                    
                    <Link href={`skype:${item[column?.fieldName!]}?call`} >{item[column!.fieldName!]}</Link>                    
                );
            }
            else if(this._hoveringColumns && this._hoveringColumns.includes(column.key)){
                iColumn.onRender = this._onRenderShowPlainHoverCard;
            }

            iColumns.push(iColumn);
        }

        return iColumns;
    }

    private _totalColumnWidth(listData: IListColumn[]): number {
        let totalColumnWidth: number;

        totalColumnWidth = listData
                            .map(v => v.maxWidth!)
                            .reduce((sum, current) => sum + current);

        // Add extra buffer
        return totalColumnWidth + 100;
    }

    private _parseHoveringColumns(commaSeparatedString: string): string[]
    {
        return commaSeparatedString.split(",");
    }
    //#endregion

    //#region Main Render Function
    public render() {
        const styles = {
            divWidth: {
                width: this._totalWidth,
            }
        };

        return (
            <Fabric>
                <ScrollablePane scrollbarVisibility={ScrollbarVisibility.auto}>
                    {/* <div style = {styles.divWidth}> */}
                        <DetailsList
                            setKey="parentcustomerid"
                            items={this.state._items}
                            columns={this.state._columns}
                            onColumnHeaderClick={this._onColumnClick}
                            layoutMode={DetailsListLayoutMode.justified}
                            constrainMode={ConstrainMode.unconstrained}
                            onItemInvoked={this._onItemInvoked}
                            selection={this._selection}
                            selectionPreservedOnEmptyClick={true}
                            selectionMode={SelectionMode.multiple}
                            onRenderDetailsHeader={this._onRenderDetailsHeader}
                            onRenderDetailsFooter={this._onRenderDetailsFooter} 
                            ariaLabelForSelectionColumn="Toggle selection"
                            ariaLabelForSelectAllCheckbox="Toggle selection for all items"
                            checkButtonAriaLabel="Row checkbox"
                        />
                    {/* </div> */}
                </ScrollablePane>
            </Fabric>
        );
    }
    //#endregion
}
