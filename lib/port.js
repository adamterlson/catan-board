function Port(resource) {
  this.ownerTile = null;
  this.direction = null;
  this.type = resource ? 'specific' : 'generic';
  this.resource = resource;
}

export default Port;