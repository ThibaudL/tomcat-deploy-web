import React from 'react';
import { connect} from 'react-redux';
import {  save } from '../../../modules/server/actions';
import { routeActions } from 'react-router-redux';


const mapStateToProps = function (state, ownProps) {
  if (ownProps.add === true) {
    return {server: {}, disabled: true};
  }
  const server = state.servers.find(s => s.id === ownProps.id);
  return {server};
};

const mapDispatchToProps = function (dispatch) {
  return {
    onBack: function () {
      dispatch(routeActions.push('/'));
    },
    onSave: function (server) {
      dispatch(save(server)).then(dispatch(routeActions.push('/')));
    }
  };
};

class ServerEdit extends React.Component {

  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.onClick = this.onClick.bind(this);
    this.state = {
      server: {},
      disabled: true
    };
  }

  componentDidMount() {
    this.setState(this.props);
  }

  componentWillReceiveProps(newProps) {
    this.setState(newProps);
  }

  onClick(e) {
    e.preventDefault();
    const host = this.refs.host.value;
    const username = this.refs.username.value;
    const password = this.refs.password.value;
    const server = {host, username, password};
    this.props.onSave(server);
    return false;
  }

  onChange(e) {
    e.preventDefault();
    const host = this.refs.host.value;
    const username = this.refs.username.value;
    const password = this.refs.password.value;
    const server = {host, username, password};
    const disabled = host.length === 0 || username.length === 0 || password.length === 0;
    this.setState({server, disabled});
  }

  render() {
    return (
      <div className="row">
        <form className="form-inline">
          <div className=" col-md-offset-2  col-md-8 col-xs-12">
            <div className="form-group col-xs-12">
              <label htmlFor="server" className="hidden-sm">Server :&nbsp;&nbsp;</label>

              <div className="input-group col-xs-11">
                <span className="input-group-addon">http://</span>
                <input type="text" id="server" className="form-control" ref="host"
                       value={this.state.server.host} aria-label="host:port"
                       placeholder="host:port" onChange={this.onChange}
                />
                <span className="input-group-addon">/manager/text</span>
              </div>
            </div>
          </div>
          <div className="col-md-offset-2 col-md-4 col-xs-12">
            <div className="form-group">
              <label htmlFor="user" className="hidden-sm">User :&nbsp;&nbsp;</label>
              <input type="text" className="form-control" id="user" ref="username"
                     value={this.state.server.username} onChange={this.onChange}
                     placeholder="User"
              />
            </div>
          </div>
          <div className="col-md-6 col-xs-12">
            <div className="form-group">
              <label htmlFor="password" className="hidden-sm">Password :&nbsp;&nbsp;</label>
              <input type="password" className="form-control" id="password" ref="password"
                     value={this.state.server.password} onChange={this.onChange} placeholder="Password"
              />
            </div>
          </div>
          <div className="col-xs-offset-4 col-xs-4">
            <button type="button" onClick={() => this.props.onBack()} className="btn btn-default">
              <li className="fa fa-backward"/>
              &nbsp;Cancel
            </button>
          </div>
          <div className=" col-xs-4">
            <button type="button" onClick={this.onClick} className="btn btn-primary" disabled={this.state.disabled}>
              <li className="glyphicon glyphicon-ok"/>
              &nbsp;Submit
            </button>
          </div>
        </form>
      </div>
    );
  }
}

ServerEdit.propTypes = {server: React.PropTypes.object.isRequired, add: React.PropTypes.bool.isRequired};


export default connect(mapStateToProps, mapDispatchToProps)(ServerEdit);
