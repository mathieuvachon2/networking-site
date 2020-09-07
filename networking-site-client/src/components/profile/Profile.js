import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import withStyles from '@material-ui/core/styles/withStyles';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import { logoutUser, uploadImage} from '../../redux/actions/userActions';
import EditDetails from './EditDetails';
import ProfileSkeleton from '../../util/ProfileSkeleton';
import MyButton from '../../util/MyButton';

// Material UI Stuff
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import MuiLink from '@material-ui/core/Link';
import Paper  from '@material-ui/core/Paper';

// Icons
import LocationOn from '@material-ui/icons/LocationOn';
import LinkIcon from '@material-ui/icons/Link';
import CalendarToday from '@material-ui/icons/CalendarToday';
import EditIcon from '@material-ui/icons/Edit';
import KeyboardReturn from '@material-ui/icons/KeyboardReturn';

const styles = (theme) => ({
    ...theme.spreadIt
});

class Profile extends Component {

    // handle upload when user Sets Profile Image
    handleImageChange = (event) => {
        const image = event.target.files[0];
        const formData = new FormData();
        formData.append('image', image, image.name);
        this.props.uploadImage(formData);
    };

    // Button To Click when user wants to change picture
    handleEditPicture = () => {
        const fileInput = document.getElementById('imageInput');
        fileInput.click();
    };

    // Handle Clicking On Logout Button
    handleLogout = () => {
        this.props.logoutUser();
    }

    render() {
        const {
            classes, 
            user: {
                    credentials: { handle, createdAt, imageUrl, bio, website, location },
                    loading,
                    authenticated
            }
        } = this.props;

        let profileMarkup = !loading ? (authenticated ? (
            <Paper className={classes.paper}>
                <div className={classes.profile}>
                    <div className="image-wrapper">
                        <img src={imageUrl} alt="profile" className="profile-image"/>
                        <input 
                            type="file" 
                            id="imageInput"
                            hidden="hidden" 
                            onChange={this.handleImageChange}
                        />
                        <MyButton tip="Edit profile picture" onClick={this.handleEditPicture} btnClassName="button">
                            <EditIcon color="primary"/>
                        </MyButton>
                    </div>
                    <hr/>
                    <div className="image-wrapper">
                        <MuiLink component={Link} to={`/users/${handle}`} color="primary" variant="h5">
                            @{handle}
                        </MuiLink>
                        <hr/>
                        {bio && <Typography variant="body2">{bio}</Typography> }
                        <hr/>
                        {location && (
                            <Fragment>
                                <LocationOn color="primary"/> <span>{location}</span>
                                <hr/>
                            </Fragment>
                        )}
                        {website && (
                            <Fragment>
                                <LinkIcon color="primary"/>
                                <a href={website} target="_blank" rel="noopener noreferrer">
                                    {' '}{website}
                                </a>
                                <hr/> 
                            </Fragment>
                        )}
                        <CalendarToday color="primary"/>{' '}
                        <span>Joined {dayjs(createdAt).format('MMM YYYY')}</span>
                    </div>
                    <MyButton tip="Logout" onClick={this.handleLogout}>
                        <KeyboardReturn color="primary"/>
                    </MyButton>
                    <EditDetails/>
                </div>
            </Paper>
        ) : (
            <Paper className={classes.paper}>
                <Typography variant="body2" align="center">
                    No profile found, please login again
                </Typography>
                <div className={classes.buttons}>
                    <Button variant="contained" color="primary" component={Link} to="/login">
                        Login
                    </Button>
                    <Button variant="contained" color="secondary" component={Link} to="/signup">
                        Signup
                    </Button>
                </div>
            </Paper>
        )) : (
        <ProfileSkeleton/>
        )

        return profileMarkup;
    }
}

const mapStateToProps = (state) => ({
    user: state.user
});

const mapActionsToProps = { logoutUser, uploadImage };

Profile.propTypes = {
    logoutUser: PropTypes.func.isRequired,
    uploadImage: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired,
    user: PropTypes.object.isRequired
}

export default connect(mapStateToProps, mapActionsToProps)(withStyles(styles)(Profile))
