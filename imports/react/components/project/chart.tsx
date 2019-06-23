import * as React from 'react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import { withTracker } from 'meteor/react-meteor-data';
import { Tries, Projects } from '../../../api/collections';
import ReactResizeDetector from 'react-resize-detector';
import * as generateColor from 'string-to-color';

export default withTracker<any, any>((props) => {
  const projectId = props.projectId;

  const project = Projects.findOne(projectId);
  const tc = Tries.find({ projectId, errors: { $exists: true } }, { sort: { createdTime: 1 } });
  
  const startTime = (project && project.createdTime) || 0

  const byUserId: any = {};
  tc.forEach(tr => {
    if (!byUserId[tr.userId]) byUserId[tr.userId] = {
      name: tr.userId,
      data: [
        { createdTime: tr.createdTime - startTime, speed: tr.speed },
      ],
    };
    else byUserId[tr.userId].data.push({ createdTime: tr.createdTime - startTime, speed: tr.speed })
  });

  const series: any[] = [];
  for (let id in byUserId) {
    series.push(byUserId[id]);
  }
  console.log(byUserId, series);

  const loading = !tc.ready();

  return {
    ...props,
    loading,
    series,
  };
})(({
  series,
}) => {
  return <ResponsiveContainer width={'98%'} height="80%">
    <LineChart>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="speed" type="number"/>
      <YAxis dataKey="createdTime" type="number"/>
      <Tooltip />
      <Legend />
      {series.map(s => (
        <Line dataKey="createdTime" data={s.data} name={s.name} key={s.name} stroke={generateColor(s.name)}/>
      ))}
    </LineChart>
  </ResponsiveContainer>;
});
