import React from 'react';
import './styles.css';
import Sidebar from '../Sidebar';
import { Avatar2 } from '../Avatar';
import Header from '../Header';
import Card from '../Card';

import { getUserLikes, getUserContribution, checkSession } from '../../actions/user';


// ProfilePage component
class ProfilePage extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            contribution: [],
            likes: [],
            displayedUser: this.props.match.params.username
        }
    }

    componentDidMount() {
        getUserContribution(this, this.state.displayedUser)
        getUserLikes(this, this.state.displayedUser)
    }

    componentWillMount () {
        checkSession(this.props.app)
    }

    render() {
        return (
            <div className='ProfilePageContainer'>
                <Sidebar currUser={this.props.location.currUser} app={this.props.app} />
                <div className='ProfilePage'>
                    <Avatar2 displayedUser={this.state.displayedUser}/>
                    <div className='ProfileHeaderContainer'>
                        <Header title="Currently Involved"/>
                    </div>
                    <ProfileSection list={this.state.contribution} currUser={this.props.location.currUser}/>

                    <div className='ProfileHeaderContainer'>
                        <Header title="Liked Stories"/>
                    </div>
                    <ProfileSection list={this.state.likes} currUser={this.props.location.currUser}/>
                </div>
            </div>
        )
    }

}

class ProfileSection extends React.Component {
    render() {
        return (
            <div className='Involved'>
                {this.props.list.map((entry) => {

                    return (
                        <Card id={entry._id} title={entry.title}
                            cover={`data:${entry.nodes[0].img.contentType};base64,
                                                ${Buffer.from(entry.nodes[0].img.data.data).toString('base64')}`}
                            body={entry.nodes[0].content} followups={entry.nodeCount}
                            contributors={entry.contributor.length} likes={entry.likes.length} currUser={this.props.currUser} />
                    );
                })}
            </div>
        )
    }
}

export default ProfilePage;
