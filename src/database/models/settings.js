
/**
 * Defining custom column names for paranoid settings (soft deletion)
 */
const paranoidSettings = Object.freeze({
    paranoid:  true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
});

module.exports = { paranoidSettings };
