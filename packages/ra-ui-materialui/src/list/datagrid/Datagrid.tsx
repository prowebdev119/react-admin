import * as React from 'react';
import {
    cloneElement,
    createElement,
    isValidElement,
    useCallback,
    useRef,
    useEffect,
    FC,
    ComponentType,
    ReactElement,
    useMemo,
} from 'react';
import PropTypes from 'prop-types';
import {
    sanitizeListRestProps,
    useListContext,
    useVersion,
    Identifier,
    Record,
    RecordMap,
    SortPayload,
} from 'ra-core';
import { TableProps } from '@mui/material';
import classnames from 'classnames';
import union from 'lodash/union';
import difference from 'lodash/difference';

import { DatagridHeader } from './DatagridHeader';
import DatagridLoading from './DatagridLoading';
import DatagridBody, { PureDatagridBody } from './DatagridBody';
import { RowClickFunction } from './DatagridRow';
import DatagridContextProvider from './DatagridContextProvider';
import { DatagridClasses, StyledTable } from './useDatagridStyles';

/**
 * The Datagrid component renders a list of records as a table.
 * It is usually used as a child of the <List> and <ReferenceManyField> components.
 *
 * Props:
 *  - rowStyle
 *
 * @example Display all posts as a datagrid
 * const postRowStyle = (record, index) => ({
 *     backgroundColor: record.nb_views >= 500 ? '#efe' : 'white',
 * });
 * export const PostList = (props) => (
 *     <List {...props}>
 *         <Datagrid rowStyle={postRowStyle}>
 *             <TextField source="id" />
 *             <TextField source="title" />
 *             <TextField source="body" />
 *             <EditButton />
 *         </Datagrid>
 *     </List>
 * );
 *
 * @example Display all the comments of the current post as a datagrid
 * <ReferenceManyField reference="comments" target="post_id">
 *     <Datagrid>
 *         <TextField source="id" />
 *         <TextField source="body" />
 *         <DateField source="created_at" />
 *         <EditButton />
 *     </Datagrid>
 * </ReferenceManyField>
 *
 *
 * @example Usage outside of a <List> or a <ReferenceManyField>.
 *
 * const currentSort = { field: 'published_at', order: 'DESC' };
 *
 * export const MyCustomList = (props) => {
 *     const { ids, data, total, loaded } = useGetList(
 *         'posts',
 *         { page: 1, perPage: 10 },
 *         currentSort
 *     );
 *
 *     return (
 *         <Datagrid
 *             basePath=""
 *             currentSort={currentSort}
 *             data={data}
 *             ids={ids}
 *             selectedIds={[]}
 *             loaded={loaded}
 *             total={total}
 *             setSort={() => {
 *                 console.log('set sort');
 *             }}
 *             onSelect={() => {
 *                 console.log('on select');
 *             }}
 *             onToggleItem={() => {
 *                 console.log('on toggle item');
 *             }}
 *         >
 *             <TextField source="id" />
 *             <TextField source="title" />
 *         </Datagrid>
 *     );
 * }
 */
const Datagrid: FC<DatagridProps> = React.forwardRef((props, ref) => {
    const {
        optimized = false,
        body = optimized ? PureDatagridBody : DatagridBody,
        header = DatagridHeader,
        children,
        className,
        empty,
        expand,
        hasBulkActions = false,
        hover,
        isRowSelectable,
        isRowExpandable,
        resource,
        rowClick,
        rowStyle,
        size = 'small',
        ...rest
    } = props;

    const {
        data,
        isLoading,
        onSelect,
        onToggleItem,
        selectedIds,
        total,
    } = useListContext(props);

    const contextValue = useMemo(() => ({ isRowExpandable }), [
        isRowExpandable,
    ]);

    const lastSelected = useRef(null);

    useEffect(() => {
        if (!selectedIds || selectedIds.length === 0) {
            lastSelected.current = null;
        }
    }, [JSON.stringify(selectedIds)]); // eslint-disable-line react-hooks/exhaustive-deps

    // we manage row selection at the datagrid level to llow shift+click to select an array of rows
    const handleToggleItem = useCallback(
        (id, event) => {
            const ids = data.map(record => record.id);
            const lastSelectedIndex = ids.indexOf(lastSelected.current);
            lastSelected.current = event.target.checked ? id : null;

            if (event.shiftKey && lastSelectedIndex !== -1) {
                const index = ids.indexOf(id);
                const idsBetweenSelections = ids.slice(
                    Math.min(lastSelectedIndex, index),
                    Math.max(lastSelectedIndex, index) + 1
                );

                const newSelectedIds = event.target.checked
                    ? union(selectedIds, idsBetweenSelections)
                    : difference(selectedIds, idsBetweenSelections);

                onSelect(
                    isRowSelectable
                        ? newSelectedIds.filter((id: Identifier) =>
                              isRowSelectable(data[id])
                          )
                        : newSelectedIds
                );
            } else {
                onToggleItem(id);
            }
        },
        [data, isRowSelectable, onSelect, onToggleItem, selectedIds]
    );

    if (isLoading === true) {
        return (
            <DatagridLoading
                className={className}
                expand={expand}
                hasBulkActions={hasBulkActions}
                nbChildren={React.Children.count(children)}
                size={size}
            />
        );
    }

    /**
     * Once loaded, the data for the list may be empty. Instead of
     * displaying the table header with zero data rows,
     * the datagrid displays nothing or a custom empty component.
     */
    if (data.length === 0 || total === 0) {
        if (empty) {
            return empty;
        }

        return null;
    }

    /**
     * After the initial load, if the data for the list isn't empty,
     * and even if the data is refreshing (e.g. after a filter change),
     * the datagrid displays the current data.
     */
    return (
        <DatagridContextProvider value={contextValue}>
            <StyledTable
                ref={ref}
                className={classnames(DatagridClasses.table, className)}
                size={size}
                {...sanitizeRestProps(rest)}
            >
                {createOrCloneElement(
                    header,
                    {
                        children,
                        hasExpand: !!expand,
                        hasBulkActions,
                        isRowSelectable,
                    },
                    children
                )}
                {createOrCloneElement(
                    body,
                    {
                        expand,
                        rowClick,
                        data,
                        hasBulkActions,
                        hover,
                        onToggleItem: handleToggleItem,
                        resource,
                        rowStyle,
                        selectedIds,
                        isRowSelectable,
                    },
                    children
                )}
            </StyledTable>
        </DatagridContextProvider>
    );
});

const createOrCloneElement = (element, props, children) =>
    isValidElement(element)
        ? cloneElement(element, props, children)
        : createElement(element, props, children);

Datagrid.propTypes = {
    basePath: PropTypes.string,
    // @ts-ignore
    body: PropTypes.oneOfType([PropTypes.element, PropTypes.elementType]),
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
    currentSort: PropTypes.exact({
        field: PropTypes.string,
        order: PropTypes.string,
    }),
    data: PropTypes.arrayOf(PropTypes.any),
    empty: PropTypes.element,
    // @ts-ignore
    expand: PropTypes.oneOfType([PropTypes.element, PropTypes.elementType]),
    hasBulkActions: PropTypes.bool,
    // @ts-ignore
    header: PropTypes.oneOfType([PropTypes.element, PropTypes.elementType]),
    hover: PropTypes.bool,
    loading: PropTypes.bool,
    onSelect: PropTypes.func,
    onToggleItem: PropTypes.func,
    resource: PropTypes.string,
    rowClick: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    rowStyle: PropTypes.func,
    selectedIds: PropTypes.arrayOf(PropTypes.any),
    setSort: PropTypes.func,
    total: PropTypes.number,
    version: PropTypes.number,
    isRowSelectable: PropTypes.func,
    isRowExpandable: PropTypes.func,
};

export interface DatagridProps<RecordType extends Record = Record>
    extends Omit<TableProps, 'size' | 'classes' | 'onSelect'> {
    body?: ReactElement | ComponentType;
    className?: string;
    expand?:
        | ReactElement
        | FC<{
              basePath: string;
              id: Identifier;
              record: Record;
              resource: string;
          }>;
    hasBulkActions?: boolean;
    header?: ReactElement | ComponentType;
    hover?: boolean;
    empty?: ReactElement;
    isRowSelectable?: (record: Record) => boolean;
    isRowExpandable?: (record: Record) => boolean;
    optimized?: boolean;
    rowClick?: string | RowClickFunction;
    rowStyle?: (record: Record, index: number) => any;
    size?: 'medium' | 'small';
    // can be injected when using the component without context
    basePath?: string;
    currentSort?: SortPayload;
    data?: RecordType[];
    loaded?: boolean;
    onSelect?: (ids: Identifier[]) => void;
    onToggleItem?: (id: Identifier) => void;
    setSort?: (sort: string, order?: string) => void;
    selectedIds?: Identifier[];
    total?: number;
}

export const injectedProps = [
    'allowEmpty',
    'isRequired',
    'setFilter',
    'setPagination',
    'limitChoicesToValue',
    'translateChoice',
];

const sanitizeRestProps = props =>
    Object.keys(sanitizeListRestProps(props))
        .filter(propName => !injectedProps.includes(propName))
        .reduce((acc, key) => ({ ...acc, [key]: props[key] }), {});

Datagrid.displayName = 'Datagrid';

export default Datagrid;
