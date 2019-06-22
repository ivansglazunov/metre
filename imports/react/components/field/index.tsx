import * as React from "react";
import _ from "lodash";
import TextField from "@material-ui/core/TextField";
import {FormControl, InputLabel, OutlinedInput, MenuItem} from "@material-ui/core";

export class Field extends React.Component<any, any, any> {
  static defaultProps = {
    delay: 300,
    allowInvalidValue: false,
  };

  state = {
    isFocused: false,
    value: this.props.value,
    invalid: false,
  };

  onValidate = (e) => {
    if (this.props.onValidate) return !!this.props.onValidate(e);
    return true;
  };

  public timeout;
  handleChange = (e) => {
    const invalid = !this.onValidate(e);
    if (!this.props.allowInvalidValue && invalid) return;
    this.setState({ invalid });
    this.setState({ value: e.target.value });
    if (!invalid && typeof(this.props.delay) === 'number' && this.props.delay > 0) {
      clearTimeout(this.timeout);
      e.persist();
      this.timeout = setTimeout(() => {
        if (this.props.onChange) this.props.onChange(e);
      }, this.props.delay);
    } else {
      if (this.props.onChange) this.props.onChange(e);
    }
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
    const { style, onValidate, error, allowInvalidValue, ...props } = this.props;
    const { value, invalid } = this.state;

    return <TextField
      {...props}
      onChange={this.handleChange}
      onFocus={this.handleFocus}
      onBlur={this.handleBlur}
      value={value || ''}
      error={invalid || error}
      style={{margin: 0, ...style}}
      margin="normal"
      variant="outlined"
      InputLabelProps={{
        shrink: true,
      }}
      inputProps={{
        ...(props.inputProps || {}),
        style: {
          padding: 3,
          ...((props.inputProps && props.inputProps.style) || {}),
        },
      }}
      SelectProps={{
        ...(props.SelectProps || {}),
        SelectDisplayProps: {
          ...((props.SelectProps && props.SelectDisplayProps) || {}),
          style: {
            padding: 3,
            ...((props.SelectProps && props.SelectDisplayProps && props.SelectDisplayProps.style) || {}),
          },
        },
      }}
      fullWidth
    />;
  }
};