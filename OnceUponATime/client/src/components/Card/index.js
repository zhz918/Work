import React from 'react';
import './styles.css';

import {Link} from 'react-router-dom';
import StatsBar from '../StatsBar'


class Card extends React.Component {

    render() {
        return (
            /* TODO: Retrieve story url and data from database */
            <Link className='urlLink' to={{ pathname: '/StoryFollow', id: this.props.id, currUser: this.props.currUser}}>
                <div className='card_container'>
                    <div className='card_title'>
                        <h3>{this.props.title}</h3>
                    </div>
                    <div className='image_container'>
                        <img src={this.props.cover} alt='' />
                    </div>

                    <div className='card_body'>
                        <p>{this.props.body}</p>

                    </div>

                    <StatsBar followups={this.props.followups} contributors={this.props.contributors} likes={this.props.likes} />
                </div>
            </Link>
        )
    }
}

export default Card;
