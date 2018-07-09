import * as React     from 'react';
import TextField      from '@material-ui/core/TextField';
import connectField   from 'uniforms/connectField';
import filterDOMProps from 'uniforms/filterDOMProps';

import MaskedInput from 'react-text-mask';

// полезно если невозможно дать однозеначно маску и окажется невозможным использовать инфу из других филдов чтобы менять маску.

function TextMaskCustom(props: any) {
  const { inputRef, ...other } = props;

  return (
    <MaskedInput
      {...other}
      ref={inputRef}
      mask={['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]}
      placeholderChar={'\u2000'}
      showMask
    />
  );
}

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
      <TextField
        error={!!error}
        helperText={error && showInlineError && errorMessage || helperText}
        label={label}
        name={name}
        placeholder={placeholder}
        type={type}
        {...filterDOMProps(props)}
        InputProps={{
          inputComponent: TextMaskCustom,
        }}
        onChange={(event: any) => disabled || onChange(event.target.value)}
        value={value}
        ref={inputRef}
        disabled={!!disabled}
      />
    );
  }
}

export default connectField(Text);