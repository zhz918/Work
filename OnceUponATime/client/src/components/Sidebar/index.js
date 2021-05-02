import React from 'react';
import './styles.css';
import { sidebarData } from './sidebarData';
import { Link } from 'react-router-dom';
import { logout } from "./../../actions/user";

class Sidebar extends React.Component {
  doLogout = (name) => {
      if (name === 'Logout') {
          logout(this.props.app)
      }
  }

  render() {
    return (
      <div className='sidebarContainer'>
        <ul className='sidebarElement'>
          {sidebarData.map((val, index) => {
            return (
              /* TODO: Retrieve urls from database */
              <Link key={index} className='urlLink' onClick={() => {this.doLogout(val.name)}} to={{
                pathname: val.name === 'Profile' ? val.link + `/${this.props.app.state.currentUser}` : val.link,
                currUser: this.props.currUser
              }}>
                <li className={val.name}
                  id={window.location.pathname === val.link ? "active" : "inactive"}>
                    <div className='sidebarName'>
                      {val.name}
                    </div>
                </li>
              </Link>
            )
          })}
        </ul>
      </div>
    )
  }
}

export default Sidebar;
