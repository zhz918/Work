import React from 'react';
import './styles.css';
import Header from '../Header';
import Card from '../Card';
import Sidebar from '../Sidebar';

import { getAllStory, deleteStoryById } from "../../actions/story";
import { checkUserType, checkSession } from "../../actions/user";

class HomePage extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      admin: false,
      stories: [],
      allStories: []
    }
  }

  /* Retrieve story data from database */
  componentWillMount () {
    checkSession(this.props.app)
    this.props.app.setState({
      loading: true
    })
    checkUserType(this);
    getAllStory(this, () => this.sortStories('Likes'));
  }

    sortStories(t) {
        let temp = this.state.stories
        switch(t) {
            case 'Likes':
                temp.sort(function(a, b) {
                    return b.likes.length - a.likes.length
                })
                break;
            case 'Date':
                temp.sort(function(a, b) {
                    const a_parts = a.nodes[0].date.split('/')
                    const b_parts = b.nodes[0].date.split('/')
                    const a_date = new Date(a_parts[2], a_parts[0], a_parts[1])
                    const b_date = new Date(b_parts[2], b_parts[0], b_parts[1])
                    return b_date - a_date
                })
                break;
            case 'Followups':
                temp.sort(function(a, b) {
                    return b.nodes.length - a.nodes.length
                })
                break;
            default:
                console.log("Invalid sorting type")
        }
        this.setState({stories: temp})
    }

  handleSearch(e) {
      e.preventDefault()
      const searchBar = document.getElementById("searchText")
      const searchText = searchBar.value.toLowerCase()
      const newStories = this.state.allStories.filter(story => {
          const titleText = story.title.toLowerCase()
          const contentText = story.nodes[0].content.toLowerCase()
          return titleText.includes(searchText) || contentText.includes(searchText)
      })
      this.setState({stories: newStories})
  }

  delete(id) {
    deleteStoryById(id, this);
  }

  render() {

    return (
      <div className='HomePageContainer'>
        <Sidebar currUser={this.props.location.currUser} app={this.props.app} />
        <div className='HomePage'>

          <div className='headerAndForm'>
            <div className='homepageTitle'>
              <Header title="Once Upon A Time" />
            </div>
          </div>

          <div className="SearchAndSort">
            <form className="searchBar" onSubmit={this.handleSearch.bind(this)}>
              <label className="searchBarLabel" htmlFor="searchText">Search</label>
              <input id="searchText" type="text" name="searchText" />
              <input className="searchBarSubmit" type="submit" value="Go" />
            </form>

            <div className="sortButtonContainer">
              <span className="sortByText">Sort by</span>
              <button className="sortButton" type="button" onClick={() => this.sortStories('Likes')}>Likes</button>
              <button className="sortButton" type="button" onClick={() => this.sortStories('Date')}>Date</button>
              <button className="sortButton" type="button" onClick={() => this.sortStories('Followups')}>Followups</button>
            </div>
          </div>

          <div className='StoryCards'>
            {this.state.stories.map((entry) => {
              return (
                <ul className='cardContainer'>
                  {this.state.admin &&
                    <div className='deleteButtonContainer'>
                      <button className='deleteButton' onClick={() => this.delete(entry._id)}>delete</button>
                    </div>}
                  <Card id={entry._id} title={entry.title}
                    cover={`data:${entry.nodes[0].img.contentType};base64,
                            ${Buffer.from(entry.nodes[0].img.data.data).toString('base64')}`}
                    body={entry.nodes[0].content} followups={entry.nodeCount}
                    contributors={entry.contributor.length} likes={entry.likes.length} currUser={this.props.location.currUser} />
                </ul>
              );
            })}
          </div>
        </div>
      </div>
    )
  }

}

export default HomePage;
