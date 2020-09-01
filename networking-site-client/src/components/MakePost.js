import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import withStyles from '@material-ui/core/styles/withStyles';
import MyButton from '../util/MyButton';

// Redux stuff
import { connect } from 'react-redux';
import { makePost } from '../redux/actions/dataActions';

// Material UI stuff
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import CircularProgress from '@material-ui/core/CircularProgress';
//Icons
import EditIcon from '@material-ui/icons/Edit';
import AddIcon from '@material-ui/icons/Add';
import CloseIcon from '@material-ui/icons/Close';

const styles = theme => ({
    ...theme,
    submitButton: {
        position: 'relative'
    },
    progressSpinner: {
        position: 'absolute'
    },
    closeButton: {
        position: 'absolute',
        left: '90%',
        top: '10%'
    }
})

class MakePost extends Component {
    state = {
        open: false,
        body: '',
        errors: {}
    };
    // To assign error(s)
    componentWillReceiveProps(nextProps) {
        if(nextProps.UI.errors) {
            this.setState({
                errors: nextProps.UI.errors
            });
        }
        if(!nextProps.UI.errors && !nextProps.UI.loading) {
            this.setState({ body: ''});
            this.handleClose();
        }
    }
    handleOpen = () => {
        this.setState({ open: true })
    };
    handleClose = () => {
        this.setState({ open: false })
    };
    handleChange = (event) => {
        this.setState({ [event.target.name]: event.target.value })
    };
    handleSubmit = (event) => {
        event.preventDefault();
        this.props.makePost({ body: this.state.body })
    };

    render() {
        const { errors } = this.state;
        const { classes, UI: { loading } } = this.props;
        return (
            <Fragment>
                <MyButton onClick={this.handleOpen} tip="Make a Post!">
                    <AddIcon/>
                </MyButton>
                <Dialog open={this.state.open} onClose={this.handleClose} fullWidth maxWidth="sm">
                    <MyButton tip="Close" onClick={this.handleClose} tipClassName={classes.closeButton}>
                        <CloseIcon/>
                    </MyButton>
                    <DialogTitle>
                        Make a New Post
                    </DialogTitle>
                    <DialogContent>
                        <form onSubmit={this.handleSubmit}>
                            <TextField
                                name="body"
                                type="text"
                                label="Post"
                                multiline
                                rows="3"
                                placeholder="Let your friends know what you are up to"
                                error={errors.body ? true: false}
                                helperText={errors.body}
                                className={classes.textField}
                                onChange={this.handleChange}
                                fullWidth
                            />
                            <Button type="submit" variant="contained" color="primary"
                                className={classes.submitButton} disabled={loading}>
                                    Submit
                                    { loading && (
                                        <CircularProgress size={30} className={classes.progressSpinner}/>
                                    )}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
                
            </Fragment>
        ) 
    }
}

MakePost.propTypes = {
    makePost: PropTypes.func.isRequired,
    UI: PropTypes.object.isRequired
};

const mapStateToProps = (state) => ({
    UI: state.UI
})

export default connect(mapStateToProps, { makePost })(withStyles(styles)(MakePost))