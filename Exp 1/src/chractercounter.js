function CharacterCounter({ count, limit }) {

  return (
    <div className="counter">

      Characters :
      <strong> {count}</strong> /
      <strong> {limit}</strong>

    </div>
  );
}

export default CharacterCounter;