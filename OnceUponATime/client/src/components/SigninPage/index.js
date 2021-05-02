import React from 'react';
import './styles.css';
import { withRouter } from 'react-router-dom';
import bookIcon from '../images/book-icon.jpg'
import { register, login, login2 } from "../../actions/user";

// SigninPage component
class SigninPage extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      error: ''
    };
  }

  /* TODO: Request the backend to login the user */
  signIn = (e) => {
    e.preventDefault();
    login(this.state.username, this.state.password, document.querySelector('#registerRespond'), this.props)
  }

  signUp=(e)=>{
    e.preventDefault();
    register(this.state.username, this.state.password, document.querySelector('#registerRespond'))
  }

  handleChange = (event)=>{
    const target = event.target;
    const value = target.value;
    const name = target.name;

    this.setState({
      [name]: value
    })
  }

  render() {
    const { app, history } = this.props

    return (
      <div className='signInContainer'>
        <div className='imageContainer'>
          <img src={bookIcon} alt=""/>
        </div>

        <div className='loginTitle'>Sign In to Once Upon a Time</div>

        <div className='formContainer'>
          <div className='loginForm'>
            <label htmlFor='username'>Username</label>
            <input onChange={this.handleChange} type='text' name='username'/>
            <label htmlFor='password'>Password</label>
            <input onChange={this.handleChange} type='text' name='password'/>
            <button onClick={() => login2(this, app, history)} className='but'>
              Sign in
            </button>
            <button onClick={this.signUp} className='but'>
              Register
            </button>
            <div id='registerRespond'></div>
          </div>
        </div>

      </div>
    )
  }

}

export default withRouter(SigninPage);
