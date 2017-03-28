import React, { createElement } from 'react';
import { Route, Switch } from 'react-router-dom';

import Restricted from './auth/Restricted';

const CrudRoute = ({ authClient = () => Promise.resolve(), resource, list, create, edit, show, remove, options }) => {
    const commonProps = {
        resource,
        options,
        hasList: !!list,
        hasEdit: !!edit,
        hasShow: !!show,
        hasCreate: !!create,
        hasDelete: !!remove,
    };
    const RestrictedPage = (component, route) => routeProps =>
        <Restricted authClient={authClient} authParams={{ resource, route }} {...routeProps}>
            {createElement(component, { ...commonProps, ...routeProps })}
        </Restricted>;
    return (
        <Switch>
            {list
                ? <Route exact path={`/${resource}`} render={RestrictedPage(list, 'list')} />
                : <Route path="dummy" />}
            {create
                ? <Route exact path={`/${resource}/create`} render={RestrictedPage(create, 'create')} />
                : <Route path="dummy" />}
            {edit
                ? <Route exact path={`/${resource}/:id`} render={RestrictedPage(edit, 'edit')} />
                : <Route path="dummy" />}
            {show
                ? <Route exact path={`/${resource}/:id/show`} render={RestrictedPage(show, 'show')} />
                : <Route path="dummy" />}
            {remove
                ? <Route exact path={`/${resource}/:id/delete`} render={RestrictedPage(remove, 'delete')} />
                : <Route path="dummy" />}
        </Switch>
    );
};

export default CrudRoute;
