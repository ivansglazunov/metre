import React from "react";
import _ from "lodash";
import TextField from "@material-ui/core/TextField";
import {FormControl, InputLabel, OutlinedInput, MenuItem} from "@material-ui/core";

// TODO check billing for edit pointer reset bug
export class Field extends React.Component<any, any, any> {
  state = {
    value: this.props.value,
  };
  componentWillReceiveProps(nextProps) {
    if (this.props.value === this.state.value && nextProps.value !== this.props.value) {
      this.setState({ value: nextProps.value });
    }
  }
  onChange = (e) => {
    this.setState({ value: e.target.value });
    if (typeof(this.props.onChange) === 'function') {
      this.props.onChange(e);
    }
  };
  render() {
    const { style, ...props } = this.props;
    const { value } = this.state;

    return <TextField
      {...props}
      onChange={this.onChange}
      value={value || ''}
      style={{margin: 0, padding: 0, ...style}}
      margin="normal"
      variant="outlined"
      InputLabelProps={{
        shrink: true,
      }}
      inputProps={{
        style: {
          padding: 3,
        },
      }}
      SelectProps={{
        SelectDisplayProps: {
          style: {
            padding: 3,
          },
        },
      }}
      fullWidth
    />;
  }
};
