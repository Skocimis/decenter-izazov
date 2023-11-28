import './componentStyles.css'

function CdpSearchInput(
    {
        roughCdpId,
        setRoughCdpId,
        handleInputChange,
        curToken
    }
){
    
    return (
        <div class="form-control">
  <input 
  class="input input-alt" 
  placeholder="Type CPID of the position" 
  required="" 
  type="text" 
  value={roughCdpId}
  onChange={e => handleInputChange(e.target.value,curToken)}
    />
  <span class="input-border input-border-alt"></span>
</div>

    )
}

export default CdpSearchInput