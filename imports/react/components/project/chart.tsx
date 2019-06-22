import * as React from 'react';
import {
  ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';
import { withTracker } from 'meteor/react-meteor-data';
import { Tries } from '../../../api/collections';
import ReactResizeDetector from 'react-resize-detector';

export default withTracker<any, any>((props) => {
  const projectId = props.projectId;

  const sc = Tries.find({ projectId, errors: { $exists: true, $size: 0 } }, { sort: { createdTime: 1 } });
  const fc = Tries.find({ projectId, errors: { $exists: true, $not: {$size: 0} } }, { sort: { createdTime: 1 } });

  const success = sc.map(t => ({ x: t.userId, y: t.speed }));
  const fail = fc.map(t => ({ x: t.userId, y: t.speed }));
  const loading = !sc.ready() || !fc.ready();

  return {
    ...props,
    loading,
    success,
    fail,
  };
})(({
  success,
  fail,
}) => {
  return <ResponsiveContainer width={'100%'} height="100%">
    <ScatterChart
      width={400}
      height={400}
      margin={{
        top: 20, right: 20, bottom: 20, left: 40,
      }}
      >
      <CartesianGrid />
      <XAxis dataKey="x" name="user" />
      <YAxis dataKey="y" name="speed" unit="ms" />
      <Tooltip cursor={{ strokeDasharray: '3 3' }} />
      <Scatter name="success" data={success} fill="#008000" />
      <Scatter name="fail" data={fail} fill="#ff0000" />
    </ScatterChart>;
  </ResponsiveContainer>
});
