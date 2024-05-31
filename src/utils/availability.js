
let availabilityChannel = undefined;
const getAvailabilityChannel = async () => { return availabilityChannel }
const setAvailabilityChannel = (channel) => { availabilityChannel = channel }

module.exports = {
    getAvailabilityChannel,
    setAvailabilityChannel
}