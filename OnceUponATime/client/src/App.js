import React from 'react';

import { Route, Switch, BrowserRouter, Redirect } from "react-router-dom";

import Homepage from './components/HomePage';
import ProfilePage from './components/ProfilePage';
import RankPage from './components/RankPage';
import ShopPage from './components/ShopPage';
import StoryFollow from './components/StoryFollowUp';
import SigninPage from './components/SigninPage';
import AddStory from './components/NewStory';

import { checkSession } from "./actions/user";

import './App.css';


// App component
class App extends React.Component {
    componentDidMount() {
        checkSession(this) // sees if a user is logged in
    }

    // global state passed down includes the current logged in user.
    state = {
        currentUser: null,
        loading: false
    }

    render() {
        const { currentUser, loading } = this.state;

        return (
            <BrowserRouter>
                <Switch>
                    <Route exact path={'/'}
                        render={props =>
                        (!currentUser ? <SigninPage {...props} app={this} />
                            : loading ? "Loading" : <Redirect to="/home" />
                        )}
                    />
                    <Route exact path={'/home'}
                        render={props =>
                        (!currentUser ? <Redirect to="/" />
                             : <Homepage {...props} app={this}/>
                        )}
                    />
                    <Route exact path={'/addStory'}
                        render={props =>
                        (!currentUser ? <Redirect to="/" />
                            : <AddStory {...props} app={this} />
                        )}
                    />
                    <Route exact path={'/StoryFollow'}
                        render={props =>
                        (!currentUser ? <Redirect to="/" />
                            : <StoryFollow {...props} app={this} />
                        )}
                    />
                    <Route exact path={'/shop'}
                        render={props =>
                        (!currentUser ? <Redirect to="/" />
                            : <ShopPage {...props} app={this} />
                        )}
                    />
                    <Route exact path={'/profile/:username'}
                        render={props =>
                        (!currentUser ? <Redirect to="/" />
                            : <ProfilePage key={props.match.params.username} {...props} app={this} />
                        )}
                    />
                    <Route exact path={'/rank'}
                        render={props =>
                        (!currentUser ? <Redirect to="/" />
                            : <RankPage {...props} app={this} />
                        )}
                    />
                    <Route render={() => <div>404 Not found</div>} />
                </Switch>
            </BrowserRouter>
        )
    }
}

export default App;
