
let availabilityChannel = undefined;
const getAvailabilityChannel = () => {return availabilityChannel}
const setAvailabilityChannel = (channel) => {availabilityChannel = channel}
module.exports = {
    getAvailabilityChannel,
    setAvailabilityChannel
}