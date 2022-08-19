import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import axios from 'axios';

const useStyles = makeStyles((theme) => ({
  content: {
    padding: theme.spacing(3, 0, 3),
  },
}));

type CSVFileImportProps = {
  url: string;
  title: string;
};

function getStatusAlertParams(statusCode: any): {
  title: any;
  message: any;
  severity: any;
} {
  let title, message, severity;

  switch (statusCode) {
    case 200:
      title = 'Success';
      message =
        'Api call with lambda authorizer was successfully executed. Great job!';
      severity = 'success';
      break;
    case 401:
      title = 'Unauthorized';
      message =
        'Make sure you add Authorization header to api call, please set token with value "dG9jaGlsYXZpY3RvcjpURVNUX1BBU1NXT1JE" into local storage';
      severity = 'error';
      break;
    case 403:
      title = 'Forbidden';
      message =
        'Authorization token value is wrong, please provide correct username:password encoded param';
      severity = 'error';
      break;

    default:
      title = 'Unknown status code';
      message = 'Unandled status code, please reach out to developer.';
      severity = 'info';
      break;
  }

  return { title, message, severity };
}

export default function CSVFileImport({ url, title }: CSVFileImportProps) {
  const classes = useStyles();
  const [file, setFile] = useState<any>();
  const [alertStatusCode, setAlertStatusCode] = useState<any>();

  const onFileChange = (e: any) => {
    console.log(e);
    let files = e.target.files || e.dataTransfer.files;
    if (!files.length) return;
    setFile(files.item(0));
  };

  const removeFile = () => {
    setFile('');
  };

  const uploadFile = async (e: any) => {
    const authorization_token = localStorage.getItem('authorization_token');

    try {
      // Get the presigned URL
      const response = await axios({
        method: 'GET',
        url,
        params: {
          name: encodeURIComponent(file.name),
        },
        headers: {
          Authorization: `Basic ${authorization_token}`,
        },
      });
      setAlertStatusCode(response.status);
      console.log('File to upload: ', file.name);
      console.log('Uploading to: ', response.data.signedUrl);
      const result = await fetch(response.data.signedUrl, {
        method: 'PUT',
        body: file,
      });
      console.log('Result: ', result);
      setFile('');
    } catch (e: any) {
      console.log(e);
      setAlertStatusCode(e.status);
    }
  };

  const statusAlert = () => {
    if (!alertStatusCode) return null;

    const { title, message, severity } = getStatusAlertParams(alertStatusCode);

    return (
      <Alert severity={severity} onClose={() => setAlertStatusCode(null)}>
        <AlertTitle>{title}</AlertTitle>
        {message}
      </Alert>
    );
  };

  return (
    <div className={classes.content}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      {!file ? (
        <input type="file" onChange={onFileChange} />
      ) : (
        <div>
          <button onClick={removeFile}>Remove file</button>
          <button onClick={uploadFile}>Upload file</button>
        </div>
      )}
      {statusAlert()}
    </div>
  );
}
