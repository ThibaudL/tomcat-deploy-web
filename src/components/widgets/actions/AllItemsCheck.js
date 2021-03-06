import React from 'react';
import {connect} from 'react-redux';
import { updateArtifacts } from '../../../modules/actions/actions';
import PropTypes from 'prop-types';

const mapStateToProps = function (state) {
  const artifacts = state.artifacts;
  if (!artifacts || artifacts.length === 0) {
    return {checked: false, disabled: true, artifacts: state.artifacts};
  }
  const checkedArtifacts = state.actions.artifacts;
  const checked = checkedArtifacts.length === artifacts.length;
  return {
    checked, disabled: false, artifacts: state.artifacts
  };
};

const mapDispatchToProps = function (dispatch) {
  return {
    onCheck(artifacts) {
      dispatch(updateArtifacts(artifacts));
    },
    onUnCheck() {
      dispatch(updateArtifacts([]));
    }
  };
};

class AllItemsCheck extends React.PureComponent {

  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
  }

  onChange() {
    if (this.props.checked) {
      this.props.onUnCheck();
    } else {
      this.props.onCheck(this.props.artifacts);
    }
  }

  render() {
    return (
      <input type="checkbox" disabled={this.props.disabled} className="success material-checkbox" checked={this.props.checked}
             onChange={this.onChange}/>
    );
  }
}

AllItemsCheck.propTypes = {
  disabled: PropTypes.bool.isRequired,
  checked: PropTypes.bool.isRequired,
  artifacts: PropTypes.array.isRequired
};

export default connect(mapStateToProps, mapDispatchToProps)(AllItemsCheck);
