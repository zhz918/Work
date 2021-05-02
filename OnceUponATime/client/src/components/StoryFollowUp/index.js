import React from 'react';
import './styles.css';
import Sidebar from '../Sidebar';
import Header from '../Header';
import StatsBar from '../StatsBar';
import { Link } from 'react-router-dom';
import { getStoryById, likeStory, updateNode, deleteNodes, clearNode} from "../../actions/story";
import { checkUserType, checkSession} from "../../actions/user";

// export default function StoryFollow(props) {

//     //return <StoryC id={props.match.params.id} currUser={props.location.user}/>

//     return <StoryC id={props.location.id} currUser={props.location.currUser} />
// }

export default class StoryFollow extends React.Component {

    constructor(props){
        super(props)
        this.state = {
            admin: false,
            userAvatar: {
                data:{
                    data: []
                },
                contentType: ''
            },
            curNode: '',
            newnode: {
                content : '',
                option1 : '',
                option2 : '',
                image: null
            },
            previous: [],
            story: {
                contributor: [],
                likes: [],
                title: '',
                nodeCount: 0,
                nodes: [],
                closed: false
            },
            node: {
                img: {
                    data:{
                        data: []
                    },
                    contentType: ''
                },
                options: [['',''],['','']],
                author: '',
                date: '',
                content: '',
                follow: false
            }
        }
    }

    //DONE
    componentDidMount() {
        getStoryById(this.props.location.id, this)
        checkUserType(this)
    }

    componentWillMount () {
        checkSession(this.props.app)
    }

    //DONE
    nextNode = (option) => {
        this.state.previous.push([this.state.node.content, option[1]])

        const node = this.state.story.nodes.find(node => {
            return node._id === option[0]
        })
        this.setState({
            curNode: option[0],
            node: node
        })
    }

    //handle change for user input for new node
    handleChange = (event)=>{
        const target = event.target;
        let value = target.value;
        const name = target.name;
        let newN = this.state.newnode;
        if(name === 'image'){
            value = target.files[0];
        }
        newN[name] = value
        this.setState({
            newnode: newN
        })
    }

    //add and update node base on user's input
    Add = (event) => {
        event.preventDefault();

        const content = this.state.newnode.content
        const op1 = this.state.newnode.option1
        const op2 = this.state.newnode.option2
        const img = this.state.newnode.image
        const id = this.state.story._id
        const nid = this.state.curNode
        if (content && op1 && op2 && img && id && nid){
            updateNode(content, op1, op2, img, id, nid, this)
        }else{
            alert('empty field')
        }

    }

    //DONE
    updateNewLikes = () => {
        likeStory(this.state.story._id, this)
    }

    //DONE
    //Get list of nodes need to be delete
    childNodes = (id, nodes) => {
        var node = this.state.story.nodes.find(node => {
            return node._id === id
        })
        if (node.follow){
            this.childNodes(node.options[0][0], nodes)
            this.childNodes(node.options[1][0], nodes)
        }
        if (id !== this.state.curNode){
            nodes.push(node._id)
        }
    }

    //update the current page with an empty node, delete child nodes
    delete = () => {

        const curNode = this.state.curNode
        if (this.state.story.nodes[0]._id === curNode){
            alert('cannot delete root')
        }else{
            const children = []
            this.childNodes(curNode, children)

            deleteNodes(this.state.story._id, children, this)
            clearNode(this.state.story._id, curNode, this)
        }

    }

    render() {
        return (
            <div className='followupContainer'>
                <Sidebar currUser={this.props.location.currUser} app={this.props.app} />
                <div className='followup'>
                    <Header title={this.state.story.title} />
                    <div className='StoryContainer'>
                        <div className='statAndButtons'>
                            {/* stats of current story */}
                            <StatsBar followups={this.state.story.nodeCount}
                                contributors={this.state.story.contributor.length}
                                likes={this.state.story.likes.length}
                            />
                            <button onClick={this.updateNewLikes} className='like_b'>
                                {this.state.story.likes.includes(this.props.location.currUser) ? ('unLike') : ('Like')}
                            </button>
                        </div>


                        {/* main story page */}
                        {/* check if there exist option or user need to write their own story */}
                        {this.state.node.follow ? (
                            <div className='followExist'>
                                {this.state.admin &&
                                    <button onClick={this.delete} className='delete_b'>
                                        Delete
                                    </button>
                                }

                                <div className='StoryInfo'>
                                    <p>
                                        <Link className="RankLink" to={{ pathname: '/profile/' + this.state.node.author }}>
                                        <b>author: </b>{this.state.node.author}
                                        <img className='authorAvatar' src={`data:${this.state.userAvatar.contentType};base64,
                                            ${Buffer.from(this.state.userAvatar.data.data).toString('base64')}`} />
                                        </Link>
                                        <span><b>date: </b>{this.state.node.date}</span>
                                    </p>
                                </div>

                                <div className='ContectImage' >
                                    <div className='StoryContent'><p>{this.state.node.content}</p></div>
                                    <img className='StoryImg' src={`data:${this.state.node.img.contentType};base64,
                                        ${Buffer.from(this.state.node.img.data.data).toString('base64')}`} alt=""/>
                                </div>

                                <div className='choices'>
                                    {this.state.node.options.map((item, index) => {
                                        return (
                                            <button key={'b'+index} className='choice'
                                                    onClick={() => this.nextNode(item)}>{item[1]} </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ):(
                            this.state.story.closed ? (
                                <div className='followExist'>
                                    <p>This story is closed by admin. Can not post followup to this story.</p>
                                </div>
                            ) : (
                                <div className='followExist'>
                                <p>This is end of the story, post your own followup</p>
                                <div className="newNodeForm">
                                    <label>New content</label>
                                    <textarea onChange={this.handleChange} type='text' name='content' placeholder='new content' />
                                    <label>Option 1</label>
                                    <textarea onChange={this.handleChange} type='text' name='option1' placeholder='option1' />
                                    <label>Option 2</label>
                                    <textarea onChange={this.handleChange} type='text' name='option2' placeholder='option2' />
                                    <label>Image</label>
                                    <input type="file" name='image' accept="image/*" onChange={this.handleChange}/>
                                    <button onClick={this.Add} >
                                        Post
                                    </button>
                                </div>
                            </div>
                            )

                        )}

                    </div>

                    <div className='previousStorys'>
                        {this.state.previous.map((item, index) => {
                            return (
                                <Previous key={index} className='previousStory' content={item[0]} choice={item[1]} />
                            );
                        })}
                    </div>
                </div>

            </div>
        )
    }
}
//render the story history components.
//Users can view the previous nodes added before, those nodes are not added to anywhere.
class Previous extends React.Component {
    render() {
        return (
            <div className='previousStory'>
                <p>
                    {this.props.content}
                </p>
                <p>
                    <b>You choose:</b> {this.props.choice}
                </p>
            </div>
        )
    }
}
