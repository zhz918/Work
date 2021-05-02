import React from 'react';
import { Route, Switch, BrowserRouter } from 'react-router-dom';
import Login from './Components/Login/Login.js'
import './Intro.css';
import Registration from './Components/Registration/Registration.js';
import Dashboard from './Components/Dashboard/Dashboard.js';
import InfoInput from './Components/InformationInput/InfoInput.js';
import ResetPassword from './Components/ResetPassword/ResetPassword'
import RetirementDebt from './Components/RetirementDebt/RetirementDebt.js'

function Intro() {

  return (
    <div>
    <BrowserRouter>
      <Switch>
        <Route exact path='/' render={() => (<Login />)} />
        <Route exact path='/Registration' render={() => (<Registration />)} />
        <Route exact path='/Dashboard' render={() => (<Dashboard />)} />
        <Route exact path='/InfoInput' render={() => (<InfoInput />)} />
        <Route exact path='/ResetPassword' render={() => (<ResetPassword />)} />
        <Route exact path='/RetirementDebt'>
          <RetirementDebt />
        </Route>
      </Switch>
    </BrowserRouter>
    </div>
  );
}

export default Intro;
