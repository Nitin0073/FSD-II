const platforms = [
  "Facebook",
  "Instagram",
  "Twitter",
  "LinkedIn"
];

function PlatformSelector({ selectedPlatform, setSelectedPlatform }) {
  return (
    <div className="section">

      <label>Select Platform</label>

      <select
        value={selectedPlatform}
        onChange={(e) => setSelectedPlatform(e.target.value)}
      >

        {platforms.map((platform) => (
          <option key={platform}>
            {platform}
          </option>
        ))}

      </select>

    </div>
  );
}

export default PlatformSelector;