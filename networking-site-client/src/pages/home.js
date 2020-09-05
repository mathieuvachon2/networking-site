import React, { Component } from 'react'
import { Grid } from '@material-ui/core'
import PropTypes from 'prop-types';

import Post from '../components/posts/Post';
import Profile from '../components/profile/Profile';

import { connect } from 'react-redux';
import { getPosts } from '../redux/actions/dataActions';

class home extends Component {
    // Get the posts from the Server
    componentDidMount(){
        this.props.getPosts()
    }

    render() {
        const { posts, loading}  = this.props.data;
        let recentPostsMarkup = !loading ? (
           posts.map(post => <Post key={post.postID} post={post}/>	)
        ) : <p>Loading...</p>
        return (
        <Grid container spacing={16}>
            <Grid item sm={8} xs={12}>
                {recentPostsMarkup}
            </Grid>
            <Grid item sm={4} xs={12}>
                <Profile/>
            </Grid>
        </Grid>
        )
    }
}

home.propTypes = {
    getPosts: PropTypes.func.isRequired,
    data: PropTypes.object.isRequired
}

const mapStateToProps = state => ({
    data: state.data
});

export default connect(mapStateToProps, { getPosts })(home);
