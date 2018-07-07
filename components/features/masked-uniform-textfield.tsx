import * as React     from 'react';
import TextField      from '@material-ui/core/TextField';
import connectField   from 'uniforms/connectField';
import filterDOMProps from 'uniforms/filterDOMProps';

import * as InputMask from 'react-input-mask';

class Text extends React.Component<any> {
  static defaultProps = {
    fullWidth: true,
    margin: 'normal',
    type: 'text'
  };
  render() {
    const {
      disabled,
      error,
      errorMessage,
      helperText,
      inputRef,
      label,
      name,
      onChange,
      placeholder,
      showInlineError,
      type,
      value,
      ...props
    } = this.props;
    return (
      <InputMask
        mask="(0)999 999 99 99"
        onChange={(event: any) => disabled || onChange(event.target.value)}
        value={value}
        ref={inputRef}
        disabled={!!disabled}
      >
        {(props: any) => <TextField
          error={!!error}
          helperText={error && showInlineError && errorMessage || helperText}
          label={label}
          name={name}
          placeholder={placeholder}
          type={type}
          {...filterDOMProps(props)}
        />}
      </InputMask>
    );
  }
}

export default connectField(Text);