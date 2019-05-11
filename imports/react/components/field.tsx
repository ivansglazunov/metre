import React from "react";
import _ from "lodash";
import TextField from "@material-ui/core/TextField";
import {FormControl, InputLabel, OutlinedInput, MenuItem} from "@material-ui/core";

export class Field extends React.Component<any, any, any> {
  state = {
    isFocused: false,
    value: this.props.value,
  };

  handleChange = (e) => {
    this.setState({ value: e.target.value });
    if (this.props.onChange) this.props.onChange(e);
  }

  handleFocus = (e) => {
    this.setState({ isFocused: true });
    if (this.props.onFocus) this.props.onFocus(e);
  }

  handleBlur = (e) => {
    this.setState({ isFocused: false });
    if (this.props.onBlur) this.props.onBlur(e);
  }

  componentWillReceiveProps(nextProps) {
    if (!this.state.isFocused) this.setState({ value: nextProps.value });
  }

  render() {
    const { style, ...props } = this.props;
    const { value } = this.state;

    return <TextField
      {...props}
      onChange={this.handleChange}
      onFocus={this.handleFocus}
      onBlur={this.handleBlur}
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
