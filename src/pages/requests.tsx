import { Key, useEffect, useState } from "react";
import { Input } from "@nextui-org/input";
import { today, getLocalTimeZone } from "@internationalized/date";
import { DatePicker } from "@nextui-org/date-picker";
import { button } from "@nextui-org/theme";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  getKeyValue,
} from "@nextui-org/table";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure
} from "@nextui-org/modal";

import { title } from "@/components/primitives";
import DashboardLayout from "@/layouts/dashboard";
import { useAppSelector } from "@/hooks/reduxHooks";
import { PhPencilSimple } from "@/components/icons";
import { cancelRequest, changeRequest, completeRequest, getRequests, JWT_SECRET, signJWT } from "@/config/io";
import { Button } from "@nextui-org/button";

interface RequestsType {
  createdAt: string,
  description?: string,
  id: string,
  parcel?: string,
  receivedAt?: string,
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
  const [sortKey, setSortKey] = useState<string>("");

  const [newDescription, setNewDescription] = useState("")
  const [newStatus, setNewStatus] = useState("")

  const userData = useAppSelector((state) => state.user);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [modalData, setModalData] = useState<RequestsType | null>(null);

  async function handleEdit(requestId: string, type: string) {
    switch (type) {
      case "change":
        const props = {
          userId: userData.id,
          requestId,
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
    setFiltered(data => data.filter(item => {
      const dateCompareOG = new Date(item.createdAt).toLocaleDateString("uk-UA");
      const dateCompareNEW = new Date(sortKey).toLocaleDateString("uk-UA");
      return dateCompareOG === dateCompareNEW
    }))
    if (filtered.length === 0 && !sortKey) {
      setFiltered(data)
    }
  }, [sortKey])
  return (
    <DashboardLayout>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-4">
        <h1 className={title({ size: "sm" })}>Requests</h1>
        <div className="relative flex gap-4">
          <DatePicker
            onChange={(val) => setSortKey(val.toString())}
            className="w-5/6 sm:w-full mt-4"
            label={"Date of creation"}
            variant="faded"
          />
          <button
            className={button({ fullWidth: true, size: "sm", color: "warning", isDisabled: sortKey ? false : true }) + " absolute left-px"}
            onClick={() => setSortKey("")}>Clear filter</button>

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

                    </section>
                    <div className="flex flex-grow w-full justify-center gap-4">
                      <Button color="success" size="md" onPress={() => handleEdit(modalData.id, "complete")}>Complete</Button>
                      <Button color="danger" size="md" onPress={() => handleEdit(modalData.id, "cancel")}>Cancel</Button>
                    </div>
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
              let colKey: Key;
              return (
                <TableRow
                  className="transition-all hover:border-gray-800 hover:bg-gray-500 hover:cursor-pointer"
                  key={item.id}
                  onClick={() => openEditModal(item.id)}>
                  {(columnKey) => {
                    const createdAtFullDate = new Date(item.createdAt).toLocaleDateString("uk-UA") + " - " + new Date(item.createdAt).toLocaleTimeString("uk-UA");
                    const receivedAtFullDate = item.receivedAt ? `${new Date(item.receivedAt).toLocaleDateString("uk-UA") + " - " + new Date(item.receivedAt).toLocaleTimeString("uk-UA")}` : null;
                    return <TableCell
                      key={columnKey + "@" + item.id}
                      className={`${columnKey === "status" ? "text-danger-500" : ""} ${columnKey === "id" ? " w-0 overflow-x-hidden text-ellipsis" : ""}`}
                    >
                      {item[columnKey]
                        ? columnKey === "route"
                          ? `${item[columnKey].from} - ${item[columnKey].to}`
                          : columnKey === 'createdAt' ? createdAtFullDate
                            : columnKey === 'receivedAt' ? receivedAtFullDate
                              : item[columnKey]
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
