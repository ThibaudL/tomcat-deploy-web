import React from 'react';
import Title from '../../widgets/Title';
import ServerEdit from '../../widgets/server/ServerEdit';


export class ServerAddPage extends React.Component {
  render() {
    return (
      <div>
        <Title text="Add and Save server"/>
        <div className="row">
          <div className="panel panel-default col-xs-offset-1 col-xs-10">
            <div className="panel-body">
              <ServerEdit add={true}/>
            </div>
          </div>
        </div>
      </div>
    );
  }
}


