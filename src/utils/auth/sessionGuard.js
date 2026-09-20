let activeUserId = null;

export const setActiveUserId = (userId) => {
  activeUserId = userId || null;
};

export const getActiveUserId = () => activeUserId;

export const isActiveUser = (userId) => activeUserId === userId;
