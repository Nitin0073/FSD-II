function ValidationMessage({ message, error }) {

  if (!message) return null;

  return (
    <p className={error ? "error" : "success"}>
      {message}
    </p>
  );
}

export default ValidationMessage;