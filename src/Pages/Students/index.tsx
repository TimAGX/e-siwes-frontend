import { useState, useEffect } from "react";

import { Routes, Route, useNavigate } from "react-router-dom";
import { Endpoints } from "../../lib/Endpoints";
import { FetchData } from "../../lib/FetchData";
import {
  SingleSupervisorResponse,
  SingleStudentResponse,
  Student,
  StudentResponse,
  Supervisor,
  SupervisorResponse,
} from "../../lib/ResponseTypes";

import {
  TableContainer,
  Table,
  TableCaption,
  Thead,
  Tr,
  Td,
  Tbody,
  Th,
  Text,
  Button,
  Stack,
  Checkbox,
  InputGroup,
  InputLeftAddon,
  Input,
} from "@chakra-ui/react";

import Container from "../Container";

export default function Students() {
  const [students, setStudents] = useState<Student[]>([]);
  const [temporaryStudents, setTemporaryStudents] = useState<Student[] | []>(
    []
  );
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);

  const [viewBankDetails, setViewBankDetails] = useState<boolean>(false);
  const [viewInternshipDetails, setViewInternshipDetails] =
    useState<boolean>(false);
  const [IsStudentLoading, setIsStudentLoading] = useState<boolean>(false);
  const [IsDataFetching, setIsDataFetching] = useState<boolean>(false);

  const [searchString, setSearchString] = useState<string>("");

  const getStudents = () => {
    setIsDataFetching(true);
    FetchData({
      type: "GET",
      route: Endpoints.GetStudents,
    })
      .then((response: StudentResponse) => {
        setIsDataFetching(false);
        if (response.data.auth) {
          setStudents(response.data.data);
          setTemporaryStudents(response.data.data);
        }
      })
      .catch(() => {
        setIsDataFetching(false);
      });
  };
  const getSupervisors = () => {
    FetchData({
      type: "GET",
      route: Endpoints.GetSupervisorProfiles,
    }).then((response: SupervisorResponse) => {
      if (response.data.auth) {
        setSupervisors(response.data.data);
      }
    });
  };

  const getSingleStudent = () => {
    FetchData({
      type: "GET",
      route: Endpoints.GetSingleStudent,
    }).then((response: SingleStudentResponse) => {
      // console.log(response);
    });
  };
  useEffect(() => {
    // Get All Students
    getStudents();
    getSupervisors();
  }, []);
  useEffect(() => {
    console.log(searchString);
    let str = searchString;
    str = str.trim();
    str = str.toLowerCase();
    if (str.length > 0) {
      // Perform student filter
      const foundStudents = temporaryStudents.filter((student) => {
        const { firstName, lastName, courseOfStudy, matricNumber } = student;
        const name = firstName.concat(" ").concat(lastName).toLowerCase();
        if (name.indexOf(str) !== -1) {
          console.log("Found this: ", name, str);
          return true;
        } else if (courseOfStudy) {
          if (courseOfStudy.toLowerCase().indexOf(str) !== -1) {
            return true;
          }
        } else if (matricNumber.indexOf(str) !== -1) {
          return true;
        }
      });
      setStudents(foundStudents);
    } else {
      setStudents(temporaryStudents);
    }
  }, [searchString]);
  const getSupervisor = (supervisorID: string) => {
    const isSupervisorFound = supervisors.filter(
      (supervisor) => supervisor.id === supervisorID
    );
    if (isSupervisorFound.length > 0) {
      return isSupervisorFound[0].firstName
        .concat(" ")
        .concat(isSupervisorFound[0].lastName);
    } else {
      return null;
    }
  };
  return (
    <>
      <br />
      <br />
      <Text size={"24px"}>Filter Table</Text>
      <br />
      <InputGroup>
        <InputLeftAddon children="Search" />
        <Input
          type="search"
          onChange={(e) => setSearchString(e.target.value)}
          placeholder="Find student by Name, Course, Matric Number"
          spellCheck={false}
        />
      </InputGroup>
      <br />
      <Stack spacing={5} direction="row">
        <Checkbox
          colorScheme="linkedin"
          checked={viewBankDetails}
          onChange={(e) => {
            setViewBankDetails(e.target.checked);
          }}
        >
          Bank Details
        </Checkbox>
        <Checkbox
          colorScheme="linkedin"
          checked={viewInternshipDetails}
          onChange={(e) => {
            setViewInternshipDetails(e.target.checked);
          }}
        >
          Internship Details
        </Checkbox>
      </Stack>
      <br />
      <Button
        colorScheme={"linkedin"}
        width={200}
        height={35}
        disabled={IsDataFetching}
        onClick={getStudents}
      >
        Refresh &nbsp;
        {IsDataFetching && <i className="far fa-spinner-third fa-spin" />}
      </Button>
      <br />
      <br />
      {IsStudentLoading && (
        <center>
          <Text fontSize={"20px"}>
            Loading &nbsp;
            <i className="far fa-spinner-third fa-spin" />
          </Text>
        </center>
      )}
      {students.length > 0 && !IsStudentLoading ? (
        <>
          <TableContainer
            border={"1px"}
            borderRadius={20}
            borderColor="#E2E8F0"
          >
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Matric Number</Th>
                  <Th>First Name</Th>
                  <Th>Last Name</Th>
                  <Th>Email</Th>
                  <Th>Phone Number</Th>
                  <Th>Payment Status</Th>
                  <Th>Supervisor</Th>
                  {viewBankDetails && (
                    <>
                      <Th>Bank Name</Th>
                      <Th>Account Number</Th>
                      <Th>Sort Code</Th>
                      <Th>Master List Number</Th>
                    </>
                  )}
                  <Th>Level</Th>
                  <Th>Course</Th>
                  {viewInternshipDetails && (
                    <>
                      <Th>Internship Duration</Th>
                      <Th>Company Name</Th>
                      <Th>Address</Th>
                    </>
                  )}
                </Tr>
              </Thead>
              <Tbody>
                {students.map((student, index) => {
                  const supervisor = getSupervisor(student.supervisor);

                  return (
                    <Tr key={student.id}>
                      <Td color={"blue.500"}>{student.matricNumber}</Td>
                      <Td>{student.firstName}</Td>
                      <Td>{student.lastName}</Td>
                      <Td>{student.email}</Td>
                      <Td>{student.phone}</Td>
                      <Td color={student.hasPaid ? "blue.600" : "red.500"}>
                        {student.hasPaid ? "Paid" : "Not Paid"}
                      </Td>
                      <Td>
                        {supervisor === null ? (
                          <i>No Supervisor assigned</i>
                        ) : (
                          supervisor
                        )}
                      </Td>
                      {viewBankDetails && (
                        <>
                          <Td>{student.bankAccount.name}</Td>
                          <Td>{student.bankAccount.number}</Td>
                          <Td>{student.bankAccount.sortCode}</Td>
                          <Td>{student.bankAccount.masterListNumber}</Td>
                        </>
                      )}
                      <Td>{student.yearOfStudy}</Td>
                      <Td>{student.courseOfStudy}</Td>
                      {viewInternshipDetails && (
                        <>
                          <Td>{student.attachmentPeriod}</Td>
                          <Td>{student.company.name}</Td>
                          <Td>{student.company.address}</Td>
                        </>
                      )}
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
            <center>
              <br />
              <Button
                type="submit"
                colorScheme="linkedin"
                width={"300px"}
                height={35}
              >
                View All
              </Button>
              <br />
              <br />
            </center>
          </TableContainer>
        </>
      ) : (
        <center>
          {!IsStudentLoading && (
            <Text fontSize="xl">There are currently no students!</Text>
          )}
        </center>
      )}
    </>
  );
}
