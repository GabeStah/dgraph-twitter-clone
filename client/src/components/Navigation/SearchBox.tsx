import React, { useState } from 'react';
import { Button, Form, FormControl } from 'react-bootstrap';
import { withRouter } from 'react-router-dom';

const SearchBox = ({ history }) => {
  const [currentText, setCurrentText] = useState('');

  const handleInputChange = event => {
    // Destructure textbox `value` field.
    const { value } = event.target;
    // Update params
    setCurrentText(value);
  };

  return (
    <>
      <Form
        inline
        onSubmit={async event => {
          event.preventDefault();
          if (!currentText || currentText.length === 0) {
            return;
          }

          // Redirect to search path.
          history.push(`/search?q=${currentText}`);
        }}
      >
        <FormControl
          id={'text'}
          className={'mr-sm-2'}
          placeholder={'Search Twitter'}
          type={'text'}
          value={currentText}
          onChange={handleInputChange}
        />
        <Button variant={'outline-success'} type={'submit'}>
          Search
        </Button>
      </Form>
    </>
  );
};

export default withRouter(SearchBox);
