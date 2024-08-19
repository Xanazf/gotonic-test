import { useEffect, useState } from "react";
import { Input } from "@nextui-org/input";
import { DatePicker } from "@nextui-org/date-picker";
import { button } from "@nextui-org/theme";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
} from "@nextui-org/table";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  useDisclosure
} from "@nextui-org/modal";

import { title } from "@/components/primitives";
import DashboardLayout from "@/layouts/dashboard";
import { useAppSelector } from "@/hooks/reduxHooks";
import { cancelRequest, changeRequest, completeRequest, getRequests, JWT_SECRET, signJWT } from "@/config/io";
import { Button } from "@nextui-org/button";
import { Divider } from "@nextui-org/divider";

interface RequestsType {
  createdAt: string,
  dispatchedAt?: string,
  receivedAt?: string,
  description?: string,
  id: string,
  parcel?: string,
  route: { from: string, to: string },
  status: string,
  type: string,
  userId: string
}

const columns = [
  { key: "id", label: "ID" },
  { key: "type", label: "TYPE" },
  { key: "route", label: "ROUTE" },
  { key: "parcel", label: "PARCEL" },
  { key: "status", label: "STATUS" },
  { key: "createdAt", label: "CREATED" },
  { key: "receivedAt", label: "RECEIVED" },
];

export default function RequestsPage() {
  const [data, setData] = useState<RequestsType[]>([]);
  const [filtered, setFiltered] = useState<RequestsType[]>([]);
  const [sortCreationKey, setSortCreationKey] = useState<string | null>("");
  const [sortDispatchKey, setSortDispatchKey] = useState<string | null>("");

  const [newDescription, setNewDescription] = useState("")
  const [newStatus, setNewStatus] = useState("")
  const [newDispatchedAt, setNewDispatchedAt] = useState("")

  const userData = useAppSelector((state) => state.user);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [modalData, setModalData] = useState<RequestsType | null>(null);

  async function handleEdit(requestId: string, type: string) {
    switch (type) {
      case "change":
        const props = {
          userId: userData.id,
          requestId,
          dispatchedAt: newDispatchedAt || undefined,
          description: newDescription || undefined,
          status: newStatus || undefined
        }
        const resChange = await changeRequest(props)
        console.log(resChange)
        break;

      case "complete":
        const resComplete = await completeRequest(requestId)
        console.log(resComplete)
        break;

      case "cancel":
        const resCancel = await cancelRequest(requestId)
        console.log(resCancel)
        break;
    }
  }

  function openEditModal(requestId: string) {
    console.log(requestId)
    const request = data.find(item => item.id === requestId)
    console.log(request)
    setModalData(request || null)
    onOpen()
  }

  function handleSortByCreation(date: string) {
    setSortDispatchKey(null)
    setSortCreationKey(date)
  }
  function handleSortByDispatch(date: string) {
    setSortCreationKey(null)
    setSortDispatchKey(date)
  }

  async function getData() {
    const encodedUserId = await signJWT(userData.id, JWT_SECRET)
    const newData = await getRequests(encodedUserId) as RequestsType[];
    console.log(data)
    if (newData.length > 0) {
      newData.sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      })
      setData(newData);
      setFiltered(newData);
    }
  }

  useEffect(() => {
    getData();
  }, [])

  useEffect(() => {
    const sortKey = sortCreationKey || sortDispatchKey;
    if (sortKey) {
      setFiltered(data => data.filter(item => {
        const dateCompareOG = new Date(item.createdAt).toLocaleDateString("uk-UA");
        const dateCompareNEW = new Date(sortKey).toLocaleDateString("uk-UA");
        return dateCompareOG === dateCompareNEW
      }))
      if (filtered.length === 0 && !sortKey) {
        setFiltered(data)
      }
    }
  }, [sortCreationKey, sortDispatchKey])
  return (
    <DashboardLayout>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-4">
        <h1 className={title({ size: "sm" })}>Requests</h1>
        <div className="w-full flex flex-col md:flex-row gap-4 justify-center">
          <DatePicker
            onChange={(val) => handleSortByCreation(val.toString())}
            className="w-5/6 sm:w-full"
            label={"Date of creation"}
            variant="faded"
          />
          <DatePicker
            onChange={(val) => handleSortByDispatch(val.toString())}
            className="w-5/6 sm:w-full"
            label={"Date of dispatch"}
            variant="faded"
          />
          <button
            className={button({ fullWidth: true, size: "lg", color: "warning", isDisabled: sortCreationKey || sortDispatchKey ? false : true }) + " mt-1"}
            onClick={() => { setSortCreationKey(null); setSortDispatchKey(null) }}>Clear filter</button>

        </div>
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg">
          <ModalContent>
            {(onClose) => {
              if (!modalData) {
                return (<></>)
              }
              return (
                <>
                  <ModalHeader>{modalData.id}</ModalHeader>
                  <ModalBody>
                    <section>
                      <h3>Previous Data</h3>
                      <p>Type: {modalData.type}</p>
                      <p>Parcel: {modalData.parcel}</p>
                      <p>Route: {modalData.route.from + " - " + modalData.route.to}</p>
                      <p>Description: {modalData.description}</p>
                      <p>Status: {modalData.status}</p>
                      <p>Created: {modalData.createdAt}</p>
                      <p>Dispatched: {modalData.dispatchedAt}</p>
                      <p>Received: {modalData.receivedAt}</p>

                    </section>
                    <div className="flex flex-grow w-full justify-center gap-4">
                      <Button color="success" size="md" onPress={() => handleEdit(modalData.id, "complete")}>Complete</Button>
                      <Button color="danger" size="md" onPress={() => handleEdit(modalData.id, "cancel")}>Cancel</Button>
                    </div>
                    <Divider className="my-1" />
                    <DatePicker
                      onChange={(val) => setNewDispatchedAt(val.toString())}
                      className="w-5/6 sm:w-full mt-4"
                      label={"Date of creation"}
                      variant="faded"
                    />
                    <Input
                      onChange={(e) => setNewDescription(e.target.value)}
                      labelPlacement="outside"
                      label="New Description"
                      type="Text"
                      className="w-full"
                      variant="faded"
                    />
                    <Input
                      onChange={(e) => setNewStatus(e.target.value)}
                      labelPlacement="outside"
                      label="New Status"
                      type="Text"
                      className="w-full"
                      variant="faded"
                    />
                    <Button isDisabled={!newDescription && !newStatus} color="primary" size="md" onPress={() => handleEdit(modalData.id, "change")}>Edit</Button>
                    <Button color="danger" size="md" variant="light" onPress={onClose}>Close</Button>

                  </ModalBody>

                </>
              )
            }}
          </ModalContent>
        </Modal>
        <Table aria-label="Table of requests">
          <TableHeader columns={columns}>
            {(column) => (
              <TableColumn key={column.key}>{column.label}</TableColumn>
            )}
          </TableHeader>
          <TableBody items={filtered}>
            {(item) => {
              return (
                <TableRow
                  className="transition-all hover:border-gray-800 hover:bg-gray-500 hover:cursor-pointer"
                  key={item.id}
                  onClick={() => openEditModal(item.id)}>
                  {(columnKey) => {
                    const createdAtFullDate = new Date(item.createdAt).toLocaleDateString("uk-UA") + " - " + new Date(item.createdAt).toLocaleTimeString("uk-UA");
                    const receivedAtFullDate = item.receivedAt ? `${new Date(item.receivedAt).toLocaleDateString("uk-UA") + " - " + new Date(item.receivedAt).toLocaleTimeString("uk-UA")}` : null;
                    // @ts-ignore
                    const currentKey = item[columnKey]
                    return <TableCell
                      key={columnKey + "@" + item.id}
                      className={`${columnKey === "status" ? "text-danger-500" : ""} ${columnKey === "id" ? " w-0 overflow-x-hidden text-ellipsis" : ""}`}
                    >
                      {currentKey
                        ? columnKey === "route"
                          ? `${item[columnKey].from} - ${item[columnKey].to}`
                          : columnKey === 'createdAt' ? createdAtFullDate
                            : columnKey === 'receivedAt' ? receivedAtFullDate
                              : currentKey
                        : "N/A"}
                    </TableCell>;
                  }}


                </TableRow>
              )
            }}
          </TableBody>
        </Table>
      </section>
    </DashboardLayout>
  );
}
