import * as React from 'react';
import MuiGridList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import ImageListItemBar from '@mui/material/ImageListItemBar';
import { makeStyles } from '@mui/material/styles';
import withWidth, { WithWidth } from '@mui/material/withWidth';
import {
    linkToRecord,
    NumberField,
    useListContext,
    DatagridProps,
    Identifier,
} from 'react-admin';
import { Link } from 'react-router-dom';
import { Breakpoint } from '@mui/material/styles/createBreakpoints';

const useStyles = makeStyles(theme => ({
    gridList: {
        margin: 0,
    },
    tileBar: {
        background:
            'linear-gradient(to top, rgba(0,0,0,0.8) 0%,rgba(0,0,0,0.4) 70%,rgba(0,0,0,0) 100%)',
    },
    placeholder: {
        backgroundColor: theme.palette.grey[300],
        height: '100%',
    },
    price: {
        display: 'inline',
        fontSize: '1em',
    },
    link: {
        color: '#fff',
    },
}));

const getColsForWidth = (width: Breakpoint) => {
    if (width === 'xs') return 2;
    if (width === 'sm') return 3;
    if (width === 'md') return 3;
    if (width === 'lg') return 5;
    return 6;
};

const times = (nbChildren: number, fn: (key: number) => any) =>
    Array.from({ length: nbChildren }, (_, key) => fn(key));

const LoadingGridList = (props: GridProps & { nbItems?: number }) => {
    const { width, nbItems = 20 } = props;
    const classes = useStyles();
    return (
        <MuiGridList
            cellHeight={180}
            cols={getColsForWidth(width)}
            className={classes.gridList}
        >
            {' '}
            {times(nbItems, key => (
                <ImageListItem key={key}>
                    <div className={classes.placeholder} />
                </ImageListItem>
            ))}
        </MuiGridList>
    );
};

const LoadedGridList = (props: GridProps) => {
    const { width } = props;
    const { ids, data, basePath } = useListContext();
    const classes = useStyles();

    if (!ids || !data) return null;

    return (
        <MuiGridList
            cellHeight={180}
            cols={getColsForWidth(width)}
            className={classes.gridList}
        >
            {ids.map((id: Identifier) => (
                <ImageListItem
                    // @ts-ignore
                    component={Link}
                    key={id}
                    to={linkToRecord(basePath, data[id].id)}
                >
                    <img src={data[id].thumbnail} alt="" />
                    <ImageListItemBar
                        className={classes.tileBar}
                        title={data[id].reference}
                        subtitle={
                            <span>
                                {data[id].width}x{data[id].height},{' '}
                                <NumberField
                                    className={classes.price}
                                    source="price"
                                    record={data[id]}
                                    color="inherit"
                                    options={{
                                        style: 'currency',
                                        currency: 'USD',
                                    }}
                                />
                            </span>
                        }
                    />
                </ImageListItem>
            ))}
        </MuiGridList>
    );
};

interface GridProps extends Omit<DatagridProps, 'width'>, WithWidth {}

const ImageList = (props: WithWidth) => {
    const { width } = props;
    const { loaded } = useListContext();
    return loaded ? (
        <LoadedGridList width={width} />
    ) : (
        <LoadingGridList width={width} />
    );
};

export default withWidth()(ImageList);
