import React from "react";
import _ from "lodash";
import TextField from "@material-ui/core/TextField";
import {FormControl, InputLabel, OutlinedInput, MenuItem} from "@material-ui/core";

export const Field = (props) => <TextField
  value={props.value || ''}
  style={{margin: 0, padding: 0, ...props.style}}
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
  {...props}
/>
