import React from 'react';
import {connect} from 'react-redux';
import TestModal from '../test/TestModal';
import { save, load } from '../../../modules/server/actions';
import { testServer } from '../../../modules/test/actions';
import { withRouter } from 'react-router';
import PropTypes from 'prop-types';

function isDisabled(server) {
  return !server.host || server.host.length === 0 || !server.username || server.username.length === 0
    || !server.password || server.password.length === 0;
}

const mapStateToProps = function (state, ownProps) {
  if (ownProps.add === true) {
    return {server: {}, disabled: true};
  }
  const server = state.servers.find(s => s.host === ownProps.id);
  if (!server) {
    return {server: {}, disabled: true};
  }
  return {server};
};

const mapDispatchToProps = function (dispatch) {
  return {
    onSave: function (server, history) {
      dispatch(save(server)).then(()=>history.push('/'));
    },
    onTest: function (host, username, password) {
      dispatch(testServer(host, username, password));
    },
    onInit: function () {
      dispatch(load());
    }
  };
};


class Edition extends React.Component {

  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.onClick = this.onClick.bind(this);
    this.onTest = this.onTest.bind(this);
    this.onBack = this.onBack.bind(this);
    this.state = {
      server: {},
      disabled: true,
      testShow: false
    };
  }

  componentWillMount() {
    const server = this.props.server;
    const disabled = isDisabled(server);
    this.setState({server, disabled});
  }

  componentDidMount() {
    this.props.onInit();
  }


  onBack(e) {
    e.preventDefault();
    this.props.history.push('/');
  }

  onClick(e) {
    e.preventDefault();
    const server = this.state.server;
    this.props.onSave(server, this.props.history);
    return false;
  }

  onTest(e) {
    e.preventDefault();
    this.setState({testShow: true});
    const host = this.refs.host.value;
    const username = this.refs.username.value;
    const password = this.refs.password.value;
    this.props.onTest(host, username, password);
  }

  onChange(e) {
    e.preventDefault();
    const host = this.refs.host.value;
    const name = this.refs.name.value;
    const username = this.refs.username.value;
    const password = this.refs.password.value;
    const server = this.state.server;
    server.host = host;
    server.name = name;
    server.username = username;
    server.password = password;
    const disabled = isDisabled(server);
    this.setState({server, disabled});
  }

  render() {
    return (
      <div className="row">
        <form className="form-inline">
          <div className="col-xs-12">
            <div className="form-group col-xs-12">
              <label htmlFor="name" className="hidden-sm">Name :&nbsp;&nbsp;</label>
                <input type="text" id="name" className="form-control" ref="name"
                       defaultValue={this.state.server.name} aria-label="The title" style={{width:'60%'}}
                       placeholder="The title in the interface" onChange={this.onChange} />
            </div>
          </div>

          <div className=" col-xs-12">

            <div className="form-group col-xs-12"  >
              <label htmlFor="server" className="hidden-sm">Server :&nbsp;&nbsp;</label>

              <div className="input-group col-xs-11">
                <span className="input-group-addon">http://</span>
                <input type="text" id="server" className="form-control" ref="host"
                       defaultValue={this.state.server.host} aria-label="host:port"
                       placeholder="host:port" onChange={this.onChange}
                />
                <span className="input-group-addon">/manager/text</span>
              </div>
            </div>
          </div>
          <div className="col-md-5 col-xs-12">
            <div className="form-group col-xs-12">
              <label htmlFor="user" className="hidden-sm">User :&nbsp;&nbsp;</label>
              <input type="text" className="form-control" id="user" ref="username" style={{width:'70%'}}
                     defaultValue={this.state.server.username} onChange={this.onChange}
                     placeholder="User"
              />
            </div>
          </div>
          <div className="col-md-6 col-xs-12">
            <div className="form-group col-xs-12">
              <label htmlFor="password" className="hidden-sm">Password :&nbsp;&nbsp;</label>
              <input type="password" className="form-control" id="password" ref="password" style={{width:'60%'}}
                     defaultValue={this.state.server.password} onChange={this.onChange} placeholder="Password"
              />
            </div>
          </div>
          <div className="col-xs-4 text-center">
            <button type="button" onClick={this.onBack} className="btn btn-default">
              <li className="fa fa-backward"/>
              &nbsp;Cancel
            </button>
          </div>
          <div className=" col-xs-4 text-center">
            <button type="button" onClick={this.onTest} className="btn btn-warning" disabled={this.state.disabled}>
              <li className="glyphicon glyphicon-transfer"/>
              &nbsp;Test
            </button>
          </div>
          <div className=" col-xs-4 text-center">
            <button type="button" onClick={this.onClick} className="btn btn-primary" disabled={this.state.disabled}>
              <li className="glyphicon glyphicon-ok"/>
              &nbsp;Submit
            </button>
          </div>
        </form>
        <TestModal show={this.state.testShow} onHide={() => this.setState({testShow: false})}/>
      </div>
    );
  }
}

Edition.propTypes = {server: PropTypes.object.isRequired, add: PropTypes.bool.isRequired};


export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Edition));