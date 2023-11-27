import './componentStyles.css'

function CdpSearchInput(
    {
        roughCdpId,
        setRoughCdpId
    }
){
    return (
        <div class="form-control">
  <input 
  class="input input-alt" 
  placeholder="Type something intelligent" 
  required="" 
  type="text" 
  value={roughCdpId}
  onChange={e => setRoughCdpId(e.target.value)}
    />
  <span class="input-border input-border-alt"></span>
</div>

    )
}

export default CdpSearchInput