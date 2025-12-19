const SystemStatus = () => {
  return (
    <section className="border border-green-400 p-4">
      <div className="flex justify-between">
        <span className="text-green-400">SYSTEM STATUS:</span>
        <span className="text-green-400">ONLINE</span>
      </div>
      <div className="mt-2">
        <span className="text-muted-foreground">zigma@oracle:~$ _</span>
      </div>
    </section>
  );
};

export default SystemStatus;
