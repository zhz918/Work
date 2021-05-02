import React from 'react';
import './styles.css';
import { getUserInfo } from "../../actions/user";

export class Avatar2 extends React.Component {
  constructor(props){
    super(props)
    this.state = {
        user: {
          avatar: {
            data:{
                data: []
            },
            contentType: ''
          },
          contribution: [],
          username: "",
          levels: 0,
          joined: "",
          points: 0
        }
    }
  }

  componentDidMount() {
    getUserInfo(this, this.props.displayedUser)
  }

  componentWillReceiveProps(nextProps) {
    getUserInfo(this, this.props.displayedUser)
  }

  render() {

    return (
      <div className='AvatarContainer'>
        <img className = 'userImage'
          src={`data:${this.state.user.avatar.contentType};base64,${Buffer.from(this.state.user.avatar.data.data).toString('base64')}`}
          alt='' />

        <div className='Description'>
          <h2>{this.state.user.username}</h2>
          <p>{"Contributions: " + this.state.user.contribution.length}</p>
          <p>{"Points: " +this.state.user.points}</p>
          <p>{"Joined: " +this.state.user.joined}</p>
          <p>{"Level: " +this.state.user.levels}</p>
        </div>
      </div>
    )
  }
}
