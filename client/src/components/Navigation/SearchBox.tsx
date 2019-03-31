import React, { useState } from 'react';
import { Button, Form, FormControl } from 'react-bootstrap';
import { withRouter, Redirect } from 'react-router-dom';

const SearchBox = ({ history }) => {
  const [currentText, setCurrentText] = useState({
    text: ''
  });

  const handleInputChange = event => {
    // Destructure textbox `id` and `value` fields.
    const { id, value } = event.target;
    // Update params
    setCurrentText({ ...currentText, [id]: value });
  };

  return (
    <>
      <Form
        inline
        onSubmit={async event => {
          event.preventDefault();
          if (!currentText || currentText.text.length === 0) {
            return;
          }

          // Redirect to search path.
          history.push(`/search?q=${currentText.text}`);
        }}
      >
        <FormControl
          id={'text'}
          className={'mr-sm-2'}
          placeholder={'Search Twitter'}
          type={'text'}
          value={currentText.text}
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
