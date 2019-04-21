import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import * as React from 'react';
import _ from 'lodash';
import { withTracker } from 'meteor/react-meteor-data';

import { HotKeys } from "react-hotkeys";

import { withStyles } from '@material-ui/core/styles';

import { Users, Nodes } from '../../api/collections/index';

const field = 'positions';
const tree = 'nesting';

const Container = (props) => <div {...props} style={{ position: 'relative', overflow: 'hidden', ...props.style }}></div>;

class Button extends React.Component<any, any, any> {
  state = { hover: false };
  onMouseOver = (e) => {
    if (this.props.onMouseOver) this.props.onMouseOver(e);
    if (!this.props.disabled) this.setState({ hover: true });
  }
  onMouseLeave = (e) => {
    if (this.props.onMouseLeave) this.props.onMouseLeave(e);
    if (!this.props.disabled) this.setState({ hover: false });
  }
  render() {
    const { hover } = this.state;
    const { disabled, active, children, style, ...props } = this.props;

    return <div style={{
      userSelect: 'none',
      boxShadow: disabled ? 'none' : `inset 0 0 0 1px gray`,
      margin: 1,
      padding: 1,
      float: 'left',
      background: hover ? 'grey' : active ? 'black' : 'transparent',
      color: active ? 'white' : 'black',
      ...style,
    }}
      {...props}
      onMouseOver={this.onMouseOver}
      onMouseLeave={this.onMouseLeave}
    >
      {children}
    </div >;
  }
}

class Index extends React.Component<any, any, any>{
  state = {
    selected: [],
    activeHistory: 0,
    history: [
      this.props,
    ],
  };

  componentDidUpdate(prevProps) {
    if (!_.isEqual(this.props, prevProps)) {
      this.setState({
        history: [...this.state.history, this.props],
        activeHistory: this.state.history.length,
      });
    }
  }

  makeReset = () => Meteor.call('nodes.reset');
  makeAdd = () => Nodes.insert({});

  findByPos = (tree, depth, left, right, space) => {
    const { history, activeHistory } = this.state;
    const docs = history[activeHistory].nodes;
    const results = [];
    for (let n = 0; n < docs.length; n++) {
      const doc = docs[n];
      if (doc.positions) {
        for (let p = 0; p < doc.positions.length; p++) {
          const position = doc.positions[p];
          if (position.tree === tree && position.depth === depth && position.left >= left && position.right <= right && position.space === space) {
            results.push({ position, doc });
          }
        }
      }
    }
    return results;
  };

  findWithoutPos = () => {
    const { history, activeHistory } = this.state;
    const docs = history[activeHistory].nodes;
    const results = [];
    for (let n = 0; n < docs.length; n++) {
      const doc = docs[n];
      if (!doc.positions) {
        results.push({ doc });
      }
    }
    return results;
  };

  level = (tree, depth, left, right, space) => {
    const docs = this.findByPos(tree, depth, left, right, space);
    return <div>
      {_.sortBy(docs, ['position.left']).map(({ position: p, doc }) => <this.Node
        key={doc._id+`${p.tree}.${p.space}.${p.left}.${p.right}.${p.depth}`}
        doc={doc}
        position={p}
        selected={this.state.selected}
      />)}
    </div>;
  }

  Node = ({
    doc: d,
    position: dp,
    style,
    children,
    selected,
  }: any) => {
    return <Button
      disabled
      style={{
        boxShadow: ~selected.indexOf(d._id) ? `inset 0 0 0 2px black` : `inset 0 0 0 1px gray`,
        textAlign: 'center',
        ...style,
      }}
    >
      <Container>
        <Button
          disabled
          onClick={() => this.setState({ selected: [d._id] })}
        >
          {d._id}
        </Button>
        {!!dp && <Button disabled style={{ fontWeight: 'bold' }}>({dp.left} | {dp.right}) </Button>}
        {!dp && <Button onClick={() => Meteor.call('nodes.put', { tree, docId: d._id, parentId: null })}>+space</Button>}
        <Button disabled={!selected.length} onClick={() => Meteor.call('nodes.put', { tree, docId: selected[0], parentId: d._id })}>+</Button>
        {!!dp && <Button onClick={() => Meteor.call('nodes.pull', { positionId: dp._id })}>-</Button>}
        {!!dp && <Button onClick={() => Meteor.call('nodes.pull', { docId: d._id, parentId: dp.parentId })}>x</Button>}
      </Container>
      {!!dp && <Container>
        {this.level(dp.tree, dp.depth + 1, dp.left, dp.right, dp.space)}
      </Container>}
      <Container>{children}</Container>
    </Button>
  };

  keyMap = {
    left: 'left',
    right: 'right',
  };

  _acCalc = (num) => {
    if (this.state.history[this.state.activeHistory + num]) {
      this.setState({ activeHistory: this.state.activeHistory + num });
    }
  };

  keyHandlers = {
    left: () => this._acCalc(-1),
    right: () => this._acCalc(1),
  };

  render() {
    const { spaces } = this.props;
    const { history, activeHistory } = this.state;

    return <div style={{ overflow: 'hidden', fontSize: 12, }}>
      <HotKeys keyMap={this.keyMap} handlers={this.keyHandlers}>
        <Container>
          <Button onClick={this.makeReset}>reset</Button>
          <Button onClick={this.makeAdd}>add</Button>
        </Container>
        history
        <Container>
          {history.map((h, i) => (
            <Button
              key={i}
              active={activeHistory === i}
              onClick={() => this.setState({ activeHistory: i })}
            >{i}</Button>
          ))}
        </Container>
        in spaces
        <Container>
          {spaces.map(s => (
            <div key={s}>
              {s}
              <Container>
                {this.level(tree, 0, 0, 99999999999999, s)}
              </Container>
            </div>
          ))}
        </Container>
        not in space
        <Container>
          {this.findWithoutPos().map(({ doc }) => (
            <this.Node key={doc._id} doc={doc} style={{ float: 'left' }} selected={this.state.selected} />
          ))}
        </Container>
      </HotKeys>
    </div>;
  }
}

const tracked = withTracker((props) => {
  const users = Users.find();
  const nc = Nodes.find();
  const nodes = nc.fetch();
  const spaces = {};
  for (let n = 0; n < nodes.length; n++) {
    const node = nodes[n];
    if (node.positions) {
      for (let p = 0; p < node.positions.length; p++) {
        const position = node.positions[p];
        spaces[position.space] = true;
      }
    }
  }
  return {
    ready: users.ready() && nc.ready(),
    users: users.fetch(),
    nodes,
    spaces: Object.keys(spaces),
    ...props,
  };
})((props: any) => <Index {...props} />);

const styled = withStyles(theme => ({}))(tracked);

export default styled;
