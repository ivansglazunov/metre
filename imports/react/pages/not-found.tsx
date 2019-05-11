import * as React from 'react';
import _ from 'lodash';
import { withTracker } from 'meteor/react-meteor-data';
import { Users, Nodes } from '../../api/collections/index';

class NotFound extends React.Component<any, any, any> {
  render() {
    const { node } = this.props;

    return <div>
      <div>404</div>
      <pre><code>{JSON.stringify(node)}</code></pre>
      <input value={node && node.nums[0].value} onChange={(e) => Nodes.update(node._id, { $set: { 'nums.0.value': e.target.value } })}/>
    </div>;
  }
}

export default withTracker((props) => {
  return {
    node: Nodes.findOne('WQHWSjxgKjxzjAk9D'),
  };
})((props: any) => <NotFound {...props}/>);