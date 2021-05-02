import React from 'react';
import './styles.css';
import Header from '../Header';
import Sidebar from '../Sidebar';
import { addStory } from "../../actions/story";
import { checkSession } from "../../actions/user";

class AddStory extends React.Component{
  constructor(props) {
    super(props)
    this.state = {
      title: "",
      content: "",
      option1: "option1",
      option2: "option2",
      image: null
    }
  }

    componentWillMount () {
        checkSession(this.props.app)
    }

  handleChange = (event) => {
    const target = event.target;
    const value = target.value;
    const name = target.name;

    this.setState({
      [name]: value
    })
  }

  fileUpload = (event) => {
    this.setState({image: event.target.files[0]})
  }

  AddStory = () => {
    const title = this.state.title
    const content = this.state.content
    const op1 = this.state.option1
    const op2 = this.state.option2
    const img = this.state.image
    if (title.length > 0 && content.length > 0 && op1.length > 0 && op2.length > 0 && img){
        addStory(title, content, op1, op2, img, this.props, this.props.location.currUser)
    }else{
      alert("Input empty")
    }
  }

  render() {
      return (
          <div className='addStory'>
            <Sidebar currUser={this.props.location.currUser} app={this.props.app} />
            <div className='FormContainer'>
              <div className="addStoryHeaderContainer">
                <Header title={"Add new story"} />
              </div>
              <div className='followExist'>
                <div className="newNodeForm">
                    <label>Title</label>
                    <textarea onChange={this.handleChange} type='text' name='title' placeholder='Story title' />

                    <label>Content</label>
                    <textarea onChange={this.handleChange} type='text' name='content' placeholder='Story content' />

                    <label>Option 1</label>
                    <textarea onChange={this.handleChange} type='text' name='option1' placeholder='option1' />

                    <label>Option 2</label>
                    <textarea onChange={this.handleChange} type='text' name='option2' placeholder='option2' />

                    <label>Image</label>
                    <input type="file" name='image' accept="image/*" onChange={this.fileUpload}/>

                    <button onClick={this.AddStory} >
                        Post
                    </button>
                </div>
            </div>
            </div>
          </div>
    )
  }

}

export default AddStory;
