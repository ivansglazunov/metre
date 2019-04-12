import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import * as React from 'react';
import _ from 'lodash';
import { withTracker } from 'meteor/react-meteor-data';

// @ts-ignore
import { withStyles } from '@material-ui/core/styles';

import { Firstname } from '@bit/ivansglazunov.metre.firstname';
import { UserPosts } from '@bit/ivansglazunov.metre.userposts';

import { Users, Posts } from '../../api/collections/index';

class Component extends React.Component <any, any, any>{
  state = {
    open: true,
  };

  // @ts-ignore
  createUser = () => Accounts.createUser({ username: 'test', password: 'test' });

  // @ts-ignore
  logout = () => Accounts.logout();

  createRandomPost = () => Posts.insert({ userId: Meteor.userId(), content: Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5) });

  randomUsername = () => Users.update(Meteor.userId(), { $set: { 'profile.username':  Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5) } });

  removePost = (id) => Posts.remove(id);

  render() {
    const { open } = this.state;

    return <div>
      <div style={{ fontWeight: 'bold' }}>
        JSON.stringify(this.props.users)
      </div>
      <div>
        {JSON.stringify(this.props.users)}
      </div>
      <div style={{ fontWeight: 'bold' }}>
        JSON.stringify(this.props.posts)
      </div>
      <div>
        {JSON.stringify(this.props.posts)}
      </div>
      <div style={{ fontWeight: 'bold' }}>
        @bit/ivansglazunov.metre.firstname
      </div>
      <div>
        <Firstname
          open={open}
          toggle={() => this.setState({ open: !open })}
          user={_.get(this, 'props.users.0', '')}
          create={this.createUser}
          login={() => Meteor.loginWithPassword('test', 'test')}
          logout={this.logout}
          random={this.randomUsername}
        />
      </div>
      <div style={{ fontWeight: 'bold' }}>
        @bit/ivansglazunov.metre.userposts
      </div>
      <div>
        <UserPosts
          name={_.get(this, 'props.users.0.profile.firstname', '')}
          posts={_.get(this, 'props.posts', [])}
          remove={this.removePost}
          createRandom={this.createRandomPost}
        />
      </div>
    </div>;
  }
}

const tracked = withTracker((props) => {
  const users = Users.find({});
  const posts = Posts.find({ userId: { $in: users.map(u => u._id) } });
  return {
    users: users.fetch(),
    posts: posts.fetch(),
    ...props,
  };
})((props: any) => <Component {...props}/>);

const styled = withStyles(theme => ({}))(tracked);

export default styled;
