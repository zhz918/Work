import React from 'react';
import './styles.css';
import Header from '../Header';
import Sidebar from '../Sidebar';
import { Link } from 'react-router-dom';

import { getUsers } from "../../actions/rank";
import { checkSession} from "../../actions/user";

const MAX_DISPLAYED_USERS = 8

// RankPage component
class RankPage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            ranks: [],
            type: null,
            users: []
        }

    }

    componentWillMount() {
        checkSession(this.props.app)
        getUsers(this, () => this.updateRank('Points'))
    }

    updateRank(t) {
        let temp = []
        for (let i = 0; i < this.state.users.length; i++) {
            let user = this.state.users[i]
            switch(t) {
                case 'Contributions':
                    temp.push([user.username, user.contribution.length, user.avatar])
                    break;
                case 'Levels':
                    temp.push([user.username, user.levels, user.avatar])
                    break;
                case 'Points':
                    temp.push([user.username, user.points, user.avatar])
                    break;
                default:
                    console.log("Invalid sorting type")
            }
        }

        temp.sort(this.sortFunction)
        this.setState({type: t, ranks: temp.slice(0, MAX_DISPLAYED_USERS)})
    }

    sortFunction(a, b) {
        if (a[1] === b[1]) {
            return 0;
        }
        else {
            return (a[1] > b[1]) ? -1 : 1;
        }
    }


    render() {
        return (
          <div className='RankPageContainer'>
            <Sidebar currUser={this.props.location.currUser} app={this.props.app}/>

            <div className='RankPage'>
              <Header title="Rankings"/>
              <div className="FilterButtonContainer">
                <button className="FilterButton" type="button" onClick={() => this.updateRank('Points')}>Point</button>
                <button className="FilterButton" type="button" onClick={() => this.updateRank('Levels')}>Level</button>
                <button className="FilterButton" type="button" onClick={() => this.updateRank('Contributions')}>Contribution</button>
              </div>

              <div className='Rankings'>
                <table className='RankTable'>
                  <thead>
                    <tr>
                      <th className="RankText">User</th>
                      <th className="RankText">{this.state.type}</th>
                    </tr>
                  </thead>
                  {/* TODO: Retrieve name and points, contributions, and level from database */}
                  {this.state.ranks.map((user, index) => {
                    return (
                        <tbody key={index}>
                          <tr>
                            <td>
                                <Link className="RankLink" to={{ pathname: '/profile/' + user[0] }}>
                                    <div className="NameElement">
                                        <span className="NameText">{index + 1}.</span>
                                        <img src={`data:${user[2].contentType};base64,
                                            ${Buffer.from(user[2].data.data).toString('base64')}`} alt="" height="40" width="40" />
                                        <span className="NameText">{user[0]}</span>
                                    </div>
                                </Link>
                            </td>
                            <td className="RankText">
                              {user[1]}
                            </td>
                          </tr>
                        </tbody>

                    )
                  })}
                </table>
              </div>
            </div>
          </div>
        )
    }

}

export default RankPage;
