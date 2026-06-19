function getPriorityNotifications(notifications, n = 10) {
  const weights = {
    placement: 3,
    result: 2,
    event: 1
  };

  const getWeight = (type) => {
    if (!type) return 1;
    return weights[type.toLowerCase()] || 1;
  };

  return [...notifications]
    .sort((a, b) => {
      const weightA = getWeight(a.Type || a.type);
      const weightB = getWeight(b.Type || b.type);
      
      if (weightA !== weightB) {
        return weightB - weightA;
      }
      
      const dateA = new Date(a.Timestamp || a.createdAt || 0);
      const dateB = new Date(b.Timestamp || b.createdAt || 0);
      return dateB - dateA;
    })
    .slice(0, n);
}

export { getPriorityNotifications };
