import React from 'react';
import { connect} from 'react-redux';
import { update } from '../../../modules/server/actions';


let mapStateToProps = function (state, ownProps) {
    return {
        server: state.server
    };
};

let mapDispatchToProps = function (dispatch) {
    return {
        onUpdate: function (host, username, password) {
            dispatch(update({host, username, password}));
        }
    }
};

class ServerEdit extends React.Component {

    constructor(props) {
        super(props);
        this.onChange = this.onChange.bind(this);
    }

    onChange(e) {
        const host = this.refs.host.value;
        const username = this.refs.username.value;
        const password = this.refs.password.value;
        this.props.onUpdate(host, username, password);
    }

    render() {
        return (
            <div className="row">
                <form className="form-inline">
                    <div className=" col-md-6">

                        <div className="form-group">
                            <label htmlFor="server" className="hidden-sm">Server : </label>

                            <div className="input-group">
                                <span className="input-group-addon">http://</span>
                                <input type="text" id="server" className="form-control" ref="host"
                                       value={this.props.server.host} aria-label="host:port"
                                       placeholder="host:port" onChange={this.onChange}/>
                                <span className="input-group-addon">/manager/text</span>
                            </div>
                        </div>
                    </div>
                    <div className=" col-md-6">
                        <div className="form-group">
                            <label htmlFor="user" className="hidden-sm">User : </label>
                            <input type="text" className="form-control" id="user" ref="username"
                                   value={this.props.server.username} onChange={this.onChange}
                                   placeholder="User"/>
                        </div>
                    </div>
                    <div className="col-md-offset-6 col-md-6">
                        <div className="form-group">
                            <label htmlFor="password" className="hidden-sm">Password : </label>
                            <input type="password" className="form-control" id="password" ref="password"
                                   value={this.props.server.password} onChange={this.onChange}
                                   placeholder="Password"/>
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}

ServerEdit.propTypes = {server: React.PropTypes.object.isRequired};


export default connect(mapStateToProps, mapDispatchToProps)(ServerEdit);