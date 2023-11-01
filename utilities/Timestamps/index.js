function TimestampData(doc) {
  const now = new Date();

  if (!doc.createdAt) {
    doc.createdAt = now;
  } else {
    doc.createdAt = new Date(doc.createdAt);
  }
  doc.updatedAt = now;
}

module.exports = TimestampData;
